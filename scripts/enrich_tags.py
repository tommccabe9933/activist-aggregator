#!/usr/bin/env python3
"""Enrich deploy datasets with a compact research taxonomy.

This keeps product-facing classification in the main repo by adding:
- raw artifact tags in data/data.json
- campaign / event / artifact tags in split tracker payloads
- filter metadata in data/meta.json
"""

from __future__ import annotations

import json
import re
import shutil
from hashlib import sha1
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
DATA_PATH = DATA_DIR / "data.json"
TRACKER_PATH = DATA_DIR / "campaign_tracker.json"
TRACKER_INDEX_PATH = DATA_DIR / "campaign_tracker_index.json"
TRACKER_DETAIL_DIR = DATA_DIR / "campaign_tracker_details"
META_PATH = DATA_DIR / "meta.json"

EVENT_TAGS = [
    "stake_disclosure",
    "activist_letter",
    "activist_deck",
    "proxy_filing",
    "board_nomination",
    "company_response",
    "settlement",
    "strategic_review",
    "vote_result",
]

STRATEGY_TAGS = [
    "board_change",
    "sale_process",
    "breakup",
    "capital_return",
    "governance",
    "operating_turnaround",
    "valuation_gap",
    "balance_sheet",
    "asset_monetization",
    "take_private_or_merger",
]

QUALITY_TAGS = [
    "primary_filing",
    "primary_fund",
    "company_release",
    "wire",
    "news",
    "provisional",
    "confirmed",
    "high_signal",
    "medium_signal",
]

WIRE_SOURCES = {"prnewswire", "businesswire", "globenewswire"}

KNOWN_ACTIVIST_FIRM_PATTERNS = [
    "elliott",
    "trian",
    "pershing square",
    "starboard",
    "third point",
    "icahn",
    "jana",
    "valueact",
    "saba capital",
    "engaged capital",
    "driver management",
    "coliseum capital",
    "raging capital",
    "baker bros",
    "orbimed",
    "discovery group",
    "land buildings",
    "mantle ridge",
    "sachem head",
    "hg vora",
    "legion partners",
    "ancora",
    "sandell",
    "alta fox",
    "bulldog investors",
    "owl creek",
    "kimmeridge",
    "inclusive capital",
    "bluebell",
    "oasis management",
    "barington",
    "soros fund management",
]

NON_ACTIVIST_FILER_PATTERNS = [
    "bank of america",
    "blackrock",
    "vanguard",
    "state street",
    "fmr",
    "wells fargo",
    "morgan stanley",
    "ubs",
    "goldman sachs",
    "deutsche bank",
    "jpmorgan",
    "norges bank",
    "capital group",
    "invesco",
    "eli lilly",
    "paramount skydance",
    "netflix",
]

ACTIVIST_STYLE_KEYWORDS = (
    "capital",
    "management",
    "partners",
    "partner",
    "advisors",
    "advisor",
    "investments",
    "investment",
    "fund",
    "funds",
    "asset",
    "opportunities",
    "value",
)

ISSUER_LIKE_KEYWORDS = (
    "corp",
    "corporation",
    "company",
    "co",
    "inc",
    "plc",
    "pharmaceutical",
    "pharmaceuticals",
    "therapeutics",
    "biosciences",
    "discovery",
    "skydance",
    "media",
    "entertainment",
    "energy",
    "holdings",
)

PRIVATE_VEHICLE_FORMS = ("llc", "lp", "ltd", "limited", "sa")

STRATEGY_RULES: list[tuple[str, tuple[str, ...]]] = [
    ("board_change", ("board", "director", "directors", "nominee", "nominees", "seat", "seats", "chairman", "ceo")),
    ("sale_process", ("strategic review", "strategic alternatives", "sale process", "explore sale", "auction", "sell the company")),
    ("breakup", ("breakup", "break up", "spin-off", "spinoff", "split-up", "split up", "separation", "separate businesses", "sum-of-the-parts")),
    ("capital_return", ("buyback", "repurchase", "capital return", "return capital", "dividend", "special dividend")),
    ("governance", ("governance", "bylaw", "bylaws", "poison pill", "rights plan", "control", "dual class")),
    ("operating_turnaround", ("turnaround", "cost cuts", "cost reduction", "margin improvement", "efficiency", "operations", "operating performance")),
    ("valuation_gap", ("undervalued", "valuation", "intrinsic value", "discount", "rerating", "mispriced")),
    ("balance_sheet", ("balance sheet", "debt", "leverage", "refinancing", "recapitalization", "capital structure")),
    ("asset_monetization", ("asset sale", "monetization", "monetize", "divest", "divestiture", "real estate", "sale-leaseback")),
    ("take_private_or_merger", ("take private", "go private", "merger", "acquisition", "acquire", "buyout", "m&a")),
]


def read_json(path: Path):
    return json.loads(path.read_text())


def write_json(path: Path, payload):
    path.write_text(json.dumps(payload, separators=(",", ":")))


def normalize_text(value: str | None) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", (value or "").lower())).strip()


def tokenize_entity_name(value: str | None) -> list[str]:
    return [
        token
        for token in normalize_text(value).split(" ")
        if token
        and token
        not in {
            "the",
            "and",
            "of",
            "corp",
            "corporation",
            "company",
            "co",
            "inc",
            "plc",
            "llc",
            "lp",
            "ltd",
            "limited",
            "sa",
            "holdings",
            "holding",
            "group",
        }
    ]


def looks_like_individual(name: str | None) -> bool:
    normalized = normalize_text(name)
    if not re.fullmatch(r"[a-z]+ [a-z]+(?: [a-z])?", normalized):
        return False
    business_words = set(ACTIVIST_STYLE_KEYWORDS) | set(ISSUER_LIKE_KEYWORDS) | set(PRIVATE_VEHICLE_FORMS)
    return not any(word in normalized.split(" ") for word in business_words)


def names_likely_same_entity(left: str | None, right: str | None) -> bool:
    left_tokens = tokenize_entity_name(left)
    right_tokens = tokenize_entity_name(right)
    if not left_tokens or not right_tokens:
        return False
    if " ".join(left_tokens) == " ".join(right_tokens):
        return True
    overlap = [token for token in left_tokens if token in right_tokens]
    min_len = min(len(left_tokens), len(right_tokens))
    return overlap and len(overlap) >= min(2, min_len) and len(overlap) / min_len >= 0.67


def is_activist_style_filer(name: str | None, source: str = "") -> bool:
    normalized = normalize_text(name)
    if not normalized or normalized in {"unknown", "unknown filer"}:
        return False
    if source == "sec_edgar":
        return True
    if any(pattern in normalized for pattern in KNOWN_ACTIVIST_FIRM_PATTERNS):
        return True
    if any(pattern in normalized for pattern in NON_ACTIVIST_FILER_PATTERNS):
        return False
    keyword_hits = sum(1 for keyword in ACTIVIST_STYLE_KEYWORDS if re.search(rf"\b{re.escape(keyword)}\b", normalized))
    issuer_like = any(re.search(rf"\b{re.escape(keyword)}\b", normalized) for keyword in ISSUER_LIKE_KEYWORDS)
    has_fund_legal_form = bool(re.search(r"\b(lp|llc|ltd|limited)\b", normalized))
    has_private_vehicle_form = any(re.search(rf"\b{re.escape(keyword)}\b", normalized) for keyword in PRIVATE_VEHICLE_FORMS)
    return not issuer_like and (
        keyword_hits >= 2
        or (keyword_hits >= 1 and has_fund_legal_form)
        or has_private_vehicle_form
        or looks_like_individual(normalized)
    )


def matches_known_activist_firm(name: str | None) -> bool:
    normalized = normalize_text(name)
    return any(pattern in normalized for pattern in KNOWN_ACTIVIST_FIRM_PATTERNS)


def derive_signal_tier(entry: dict) -> str:
    form_type = entry.get("form_type", "")
    activist = entry.get("activist", "")
    source = entry.get("source", "")
    if form_type in {"DFAN14A", "PRRN14A"}:
        return "high" if is_activist_style_filer(activist, source) else "low"
    if form_type in {"SC 13D", "SC 13D/A"}:
        return "medium" if is_activist_style_filer(activist, source) else "low"
    return entry.get("signal_tier") or "high"


def derive_filer_role(name: str | None, target: str | None, source: str = "") -> str:
    normalized = normalize_text(name)
    if not normalized:
        return "institutional-other"
    if is_activist_style_filer(name, source):
        is_person = looks_like_individual(normalized)
        looks_firm_like = (
            source == "sec_edgar"
            or matches_known_activist_firm(name)
            or any(re.search(rf"\b{re.escape(keyword)}\b", normalized) for keyword in ACTIVIST_STYLE_KEYWORDS)
            or any(re.search(rf"\b{re.escape(keyword)}\b", normalized) for keyword in PRIVATE_VEHICLE_FORMS)
        )
        return "individual-activist" if is_person and not looks_firm_like else "activist-firm"
    if names_likely_same_entity(name, target):
        return "issuer-company"
    if any(pattern in normalized for pattern in NON_ACTIVIST_FILER_PATTERNS):
        return "institutional-other"
    if any(re.search(rf"\b{re.escape(keyword)}\b", normalized) for keyword in ISSUER_LIKE_KEYWORDS) or any(
        re.search(rf"\b{re.escape(keyword)}\b", normalized) for keyword in PRIVATE_VEHICLE_FORMS
    ):
        return "deal-party"
    return "individual-activist" if looks_like_individual(normalized) else "institutional-other"


def sector_tag(value: str | None) -> list[str]:
    clean = (value or "").strip()
    if not clean:
        return ["unknown"]
    return [re.sub(r"[^a-z0-9]+", "_", clean.lower()).strip("_") or "unknown"]


def canonical_event_tag(event_type: str | None, title: str | None = None) -> str | None:
    normalized = normalize_text(event_type)
    title_norm = normalize_text(title)
    mapping = {
        "stake_disclosure": "stake_disclosure",
        "activist_letter": "activist_letter",
        "activist_deck": "activist_deck",
        "proxy_filing": "proxy_filing",
        "board_nomination": "board_nomination",
        "company_response": "company_response",
        "settlement": "settlement",
        "strategic_review_response": "strategic_review",
        "vote_result": "vote_result",
        "campaign_demand": "activist_letter",
        "activist_press_release": "activist_letter",
        "campaign_update": None,
    }
    if normalized in mapping:
        return mapping[normalized]
    if "13d" in normalized:
        return "stake_disclosure"
    if "proxy" in normalized:
        return "proxy_filing"
    if "settlement" in normalized:
        return "settlement"
    if "response" in normalized or "hits back" in title_norm or "facing activist" in title_norm:
        return "company_response"
    return None


def derive_event_tags_raw(entry: dict) -> list[str]:
    tags: list[str] = []
    form_type = (entry.get("form_type") or "").upper()
    title = entry.get("title") or ""
    announcement_type = entry.get("announcement_type") or ""

    if form_type in {"SC 13D", "SC 13D/A"}:
        tags.append("stake_disclosure")
    if form_type in {"DFAN14A", "PRRN14A"}:
        tags.append("proxy_filing")
    if announcement_type == "activist_stake_disclosure":
        tags.append("stake_disclosure")
    if announcement_type in {"activist_public_letter", "activist_campaign_demand", "activist_press_release"}:
        tags.append("activist_letter")
    if announcement_type == "company_board_change":
        tags.append("board_nomination")
    if announcement_type == "company_settlement":
        tags.append("settlement")
    if announcement_type == "company_strategic_review":
        tags.append("strategic_review")

    title_norm = normalize_text(title)
    if any(token in title_norm for token in ("presentation", "deck", "slides")):
        tags.append("activist_deck")
    if any(token in title_norm for token in ("letter", "letters", "open letter")):
        tags.append("activist_letter")
    if any(token in title_norm for token in ("nominee", "nominees", "director", "directors", "board seat", "board shakeup")):
        tags.append("board_nomination")
    if "strategic review" in title_norm or "strategic alternatives" in title_norm:
        tags.append("strategic_review")
    if any(token in title_norm for token in ("settlement", "cooperation agreement")):
        tags.append("settlement")
    if any(token in title_norm for token in ("responds", "response", "hits back")):
        tags.append("company_response")
    if any(token in title_norm for token in ("vote result", "wins vote", "shareholder meeting result")):
        tags.append("vote_result")

    deduped = []
    for tag in tags:
        if tag in EVENT_TAGS and tag not in deduped:
            deduped.append(tag)
    return deduped


def infer_strategy_tags(text: str) -> list[str]:
    normalized = normalize_text(text)
    tags: list[str] = []
    for tag, phrases in STRATEGY_RULES:
        if any(phrase in normalized for phrase in phrases):
            tags.append(tag)
    return tags


def infer_quality_base(source: str, evidence_rank: str | None = None, actor_side: str | None = None, artifact_type: str | None = None) -> str:
    if evidence_rank in {"primary_filing", "primary_fund", "company_release", "wire", "news"}:
        return evidence_rank
    if source in {"sec_edgar", "sec_edgar_formtype", "sec_edgar_exhibit"}:
        return "primary_filing"
    if source in {"fund_website", "10xebitda"}:
        return "primary_fund"
    if source in WIRE_SOURCES:
        if actor_side == "company" or artifact_type == "company_release":
            return "company_release"
        return "wire"
    if source == "google_news":
        return "news"
    return "news"


def enrich_raw_artifact(entry: dict) -> dict:
    enriched = dict(entry)
    signal_tier = derive_signal_tier(enriched)
    filer_role = derive_filer_role(enriched.get("activist"), enriched.get("target_company"), enriched.get("source", ""))
    event_tags = derive_event_tags_raw(enriched)
    strategy_tags = infer_strategy_tags(
        " ".join(
            filter(
                None,
                [
                    enriched.get("title"),
                    enriched.get("announcement_type"),
                    enriched.get("form_type"),
                    enriched.get("activist"),
                    enriched.get("target_company"),
                ],
            )
        )
    )
    quality_base = infer_quality_base(enriched.get("source", ""))
    quality_tags = [quality_base]
    if signal_tier == "high":
        quality_tags.append("high_signal")
    elif signal_tier == "medium":
        quality_tags.append("medium_signal")
    if quality_base in {"primary_filing", "primary_fund", "company_release"}:
        quality_tags.append("confirmed")

    enriched["signal_tier"] = signal_tier
    enriched["filer_role"] = filer_role
    enriched["event_tags"] = event_tags
    enriched["strategy_tags"] = [tag for tag in STRATEGY_TAGS if tag in strategy_tags]
    enriched["sector_tags"] = sector_tag(enriched.get("sector"))
    enriched["quality_tags"] = [tag for tag in QUALITY_TAGS if tag in quality_tags]
    return enriched


def enrich_tracker_artifact(artifact: dict, campaign_sector: str | None, campaign_status: str) -> dict:
    enriched = dict(artifact)
    event_tag = canonical_event_tag(artifact.get("event_type"), artifact.get("headline"))
    strategy_tags = infer_strategy_tags(
        " ".join(
            filter(
                None,
                [
                    artifact.get("headline"),
                    artifact.get("artifact_type"),
                    artifact.get("event_type"),
                    campaign_sector,
                ],
            )
        )
    )
    quality_base = infer_quality_base(
        artifact.get("source_name", ""),
        artifact.get("evidence_rank"),
        artifact.get("actor_side"),
        artifact.get("artifact_type"),
    )
    quality_tags = [quality_base]
    if artifact.get("evidence_rank") in {"primary_filing", "primary_fund", "company_release"}:
        quality_tags.append("confirmed")
        quality_tags.append("high_signal")
    elif quality_base in {"wire", "news"}:
        quality_tags.append("medium_signal")
    if campaign_status == "provisional":
        quality_tags.append("provisional")

    enriched["event_tags"] = [event_tag] if event_tag else []
    enriched["strategy_tags"] = [tag for tag in STRATEGY_TAGS if tag in strategy_tags]
    enriched["sector_tags"] = sector_tag(campaign_sector)
    enriched["quality_tags"] = [tag for tag in QUALITY_TAGS if tag in quality_tags]
    return enriched


def enrich_tracker_event(event: dict, campaign_sector: str | None, campaign_status: str) -> dict:
    enriched = dict(event)
    event_tag = canonical_event_tag(event.get("event_type"))
    strategy_source = " ".join(
        filter(
            None,
            [
                event.get("event_type"),
                event.get("actor_side"),
                *[artifact.get("headline", "") for artifact in event.get("artifacts", [])[:3]],
            ],
        )
    )
    quality_base = infer_quality_base(
        "",
        (event.get("artifacts") or [{}])[0].get("evidence_rank"),
        event.get("actor_side"),
        (event.get("artifacts") or [{}])[0].get("artifact_type"),
    )
    quality_tags = [quality_base]
    if event.get("is_material_node"):
        quality_tags.append("confirmed")
    if campaign_status == "provisional":
        quality_tags.append("provisional")
    if event.get("materiality_score", 0) >= 60:
        quality_tags.append("high_signal")
    enriched["event_tags"] = [event_tag] if event_tag else []
    enriched["strategy_tags"] = [tag for tag in STRATEGY_TAGS if tag in infer_strategy_tags(strategy_source)]
    enriched["sector_tags"] = sector_tag(campaign_sector)
    enriched["quality_tags"] = [tag for tag in QUALITY_TAGS if tag in quality_tags]
    enriched["artifacts"] = [enrich_tracker_artifact(artifact, campaign_sector, campaign_status) for artifact in event.get("artifacts", [])]
    enriched["coverage_artifacts"] = [
        enrich_tracker_artifact(artifact, campaign_sector, campaign_status) for artifact in event.get("coverage_artifacts", [])
    ]
    return enriched


def collect_unique_tags(*groups: list[str]) -> list[str]:
    seen: list[str] = []
    for group in groups:
        for tag in group:
            if tag and tag not in seen:
                seen.append(tag)
    return seen


def enrich_campaign(campaign: dict) -> dict:
    enriched = dict(campaign)
    status = campaign.get("campaign_status") or "provisional"
    events = [enrich_tracker_event(event, campaign.get("sector"), status) for event in campaign.get("events", [])]
    coverage_artifacts = [enrich_tracker_artifact(artifact, campaign.get("sector"), status) for artifact in campaign.get("coverage_artifacts", [])]
    low_trust_artifacts = [enrich_tracker_artifact(artifact, campaign.get("sector"), status) for artifact in campaign.get("low_trust_artifacts", [])]
    latest_event_tag = canonical_event_tag(campaign.get("latest_material_event_type"))
    all_event_tags = collect_unique_tags(
        [latest_event_tag] if latest_event_tag else [],
        *[event.get("event_tags", []) for event in events],
        *[artifact.get("event_tags", []) for artifact in coverage_artifacts],
    )
    strategy_tags = collect_unique_tags(
        infer_strategy_tags(
            " ".join(
                filter(
                    None,
                    [
                        campaign.get("canonical_activist"),
                        campaign.get("canonical_target"),
                        campaign.get("latest_material_event_type"),
                        campaign.get("sector"),
                    ],
                )
            )
        ),
        *[event.get("strategy_tags", []) for event in events],
        *[artifact.get("strategy_tags", []) for artifact in coverage_artifacts],
    )
    quality_tags = []
    confirmation = campaign.get("confirmation_source")
    if confirmation and confirmation != "none":
        quality_tags.append(confirmation)
        quality_tags.append("confirmed")
        quality_tags.append("high_signal")
    else:
        quality_tags.append("news")
        quality_tags.append("provisional")
        quality_tags.append("medium_signal")
    if status == "provisional" and "provisional" not in quality_tags:
        quality_tags.append("provisional")

    latest_event = next((event for event in events if event.get("event_id") == campaign.get("latest_material_event_id")), None)
    latest_strategy_tags = latest_event.get("strategy_tags", []) if latest_event else strategy_tags[:]

    enriched["events"] = events
    enriched["coverage_artifacts"] = coverage_artifacts
    enriched["low_trust_artifacts"] = low_trust_artifacts
    enriched["event_tags"] = [tag for tag in EVENT_TAGS if tag in all_event_tags]
    enriched["strategy_tags"] = [tag for tag in STRATEGY_TAGS if tag in strategy_tags]
    enriched["sector_tags"] = sector_tag(campaign.get("sector"))
    enriched["quality_tags"] = [tag for tag in QUALITY_TAGS if tag in quality_tags]
    enriched["latest_event_tag"] = latest_event_tag
    enriched["latest_strategy_tags"] = [tag for tag in STRATEGY_TAGS if tag in latest_strategy_tags]
    return enriched


def sanitize_campaign_id(campaign_id: str | None) -> str:
    raw = (campaign_id or "campaign").strip()
    safe = re.sub(r"[^a-zA-Z0-9._-]+", "-", raw).strip("-").lower() or "campaign"
    if safe != raw.lower() or len(safe) > 120:
        digest = sha1(raw.encode("utf-8")).hexdigest()[:10]
        safe = f"{safe[:100].rstrip('-')}-{digest}"
    return safe


def campaign_detail_rel_path(campaign_id: str | None) -> str:
    safe = sanitize_campaign_id(campaign_id)
    shard = safe[:2] if len(safe) >= 2 else "xx"
    return f"campaign_tracker_details/{shard}/{safe}.json"


def iter_campaign_artifacts(campaign: dict):
    for artifact in campaign.get("coverage_artifacts", []):
        yield artifact
    for artifact in campaign.get("low_trust_artifacts", []):
        yield artifact
    for event in campaign.get("events", []):
        for artifact in event.get("artifacts", []):
            yield artifact
        for artifact in event.get("coverage_artifacts", []):
            yield artifact


def choose_row_artifact(campaign: dict) -> dict | None:
    latest_event_id = campaign.get("latest_material_event_id")
    latest_event = next((event for event in campaign.get("events", []) if event.get("event_id") == latest_event_id), None)
    candidate_groups = [
        (latest_event or {}).get("artifacts", []),
        (latest_event or {}).get("coverage_artifacts", []),
        campaign.get("coverage_artifacts", []),
        campaign.get("low_trust_artifacts", []),
    ]
    candidate_groups.extend(event.get("artifacts", []) for event in campaign.get("events", []))
    for group in candidate_groups:
        for artifact in group:
            if artifact:
                return {
                    "raw_id": artifact.get("raw_id"),
                    "source_url": artifact.get("source_url"),
                    "pdf_filename": artifact.get("pdf_filename"),
                    "published_at": artifact.get("published_at"),
                    "headline": artifact.get("headline") or artifact.get("title"),
                    "artifact_type": artifact.get("artifact_type"),
                    "source_name": artifact.get("source_name"),
                    "evidence_rank": artifact.get("evidence_rank"),
                }
    return None


def tracker_search_text(campaign: dict) -> str:
    parts = [
        campaign.get("canonical_activist", ""),
        campaign.get("canonical_target", ""),
        campaign.get("latest_material_event_type", ""),
        campaign.get("campaign_status", ""),
        " ".join(campaign.get("event_tags", [])),
        " ".join(campaign.get("strategy_tags", [])),
        " ".join(campaign.get("quality_tags", [])),
    ]
    seen_headlines: list[str] = []
    for artifact in iter_campaign_artifacts(campaign):
        headline = (artifact.get("headline") or artifact.get("title") or "").strip()
        if headline and headline not in seen_headlines:
            seen_headlines.append(headline)
        if len(seen_headlines) >= 3:
            break
    parts.extend(seen_headlines)
    return " | ".join(part for part in parts if part)


def build_tracker_index_payload(tracker_data: dict) -> dict:
    campaigns = []
    for campaign in tracker_data.get("campaigns", []):
        material_event_types = collect_unique_tags(
            *[
                [event.get("event_type")]
                for event in campaign.get("events", [])
                if event.get("is_material_node") and event.get("event_type")
            ]
        )
        source_names = collect_unique_tags(
            *[[artifact.get("source_name")] for artifact in iter_campaign_artifacts(campaign) if artifact.get("source_name")]
        )
        campaigns.append(
            {
                "campaign_id": campaign.get("campaign_id"),
                "canonical_target": campaign.get("canonical_target"),
                "canonical_activist": campaign.get("canonical_activist"),
                "campaign_status": campaign.get("campaign_status"),
                "first_seen_at": campaign.get("first_seen_at"),
                "last_updated_at": campaign.get("last_updated_at"),
                "originating_event_id": campaign.get("originating_event_id"),
                "latest_material_event_id": campaign.get("latest_material_event_id"),
                "latest_material_event_type": campaign.get("latest_material_event_type"),
                "coverage_count": campaign.get("coverage_count", 0),
                "primary_artifact_count": campaign.get("primary_artifact_count", 0),
                "provisional": campaign.get("provisional", False),
                "confirmation_source": campaign.get("confirmation_source", "none"),
                "event_tags": campaign.get("event_tags", []),
                "strategy_tags": campaign.get("strategy_tags", []),
                "sector_tags": campaign.get("sector_tags", ["unknown"]),
                "quality_tags": campaign.get("quality_tags", []),
                "latest_event_tag": campaign.get("latest_event_tag"),
                "latest_strategy_tags": campaign.get("latest_strategy_tags", []),
                "material_event_types": material_event_types,
                "source_names": source_names,
                "search_text": tracker_search_text(campaign),
                "row_artifact": choose_row_artifact(campaign),
                "detail_path": campaign_detail_rel_path(campaign.get("campaign_id")),
            }
        )
    return {
        "campaigns": campaigns,
        "counts": tracker_data.get("counts", {}),
    }


def build_campaign_detail_payload(campaign: dict) -> dict:
    return {
        "campaign_id": campaign.get("campaign_id"),
        "events": campaign.get("events", []),
        "coverage_artifacts": campaign.get("coverage_artifacts", []),
        "low_trust_artifacts": campaign.get("low_trust_artifacts", []),
    }


def write_tracker_payloads(tracker_data: dict):
    index_payload = build_tracker_index_payload(tracker_data)
    if TRACKER_DETAIL_DIR.exists():
        shutil.rmtree(TRACKER_DETAIL_DIR)
    TRACKER_DETAIL_DIR.mkdir(parents=True, exist_ok=True)

    for campaign in tracker_data.get("campaigns", []):
        detail_path = DATA_DIR / campaign_detail_rel_path(campaign.get("campaign_id"))
        detail_path.parent.mkdir(parents=True, exist_ok=True)
        write_json(detail_path, build_campaign_detail_payload(campaign))

    write_json(TRACKER_INDEX_PATH, index_payload)


def read_tracker_payload() -> dict:
    if TRACKER_PATH.exists():
        return read_json(TRACKER_PATH)
    if TRACKER_INDEX_PATH.exists():
        index_payload = read_json(TRACKER_INDEX_PATH)
        campaigns = []
        for summary in index_payload.get("campaigns", []):
            detail = {}
            detail_path = summary.get("detail_path")
            if detail_path:
                candidate = DATA_DIR / detail_path
                if candidate.exists():
                    detail = read_json(candidate)
            merged = dict(summary)
            merged.update(detail)
            campaigns.append(merged)
        return {
            "campaigns": campaigns,
            "counts": index_payload.get("counts", {}),
        }
    raise FileNotFoundError("No tracker payload found. Provide data/campaign_tracker.json or split tracker files.")


def build_meta(raw_data: list[dict], tracker_data: dict) -> dict:
    raw_event_tags = sorted({tag for row in raw_data for tag in row.get("event_tags", [])})
    raw_strategy_tags = sorted({tag for row in raw_data for tag in row.get("strategy_tags", [])})
    raw_sectors = sorted({tag for row in raw_data for tag in row.get("sector_tags", [])})
    tracker_quality_tags = sorted({tag for campaign in tracker_data.get("campaigns", []) for tag in campaign.get("quality_tags", [])})
    raw_quality_tags = sorted({tag for row in raw_data for tag in row.get("quality_tags", [])})
    filer_roles = sorted({row.get("filer_role", "") for row in raw_data if row.get("filer_role")})
    campaign_statuses = sorted({campaign.get("campaign_status", "") for campaign in tracker_data.get("campaigns", []) if campaign.get("campaign_status")})
    meta = read_json(META_PATH) if META_PATH.exists() else {}
    meta.update(
        {
            "record_count": len(raw_data),
            "tracker_campaigns": len(tracker_data.get("campaigns", [])),
            "tracker_confirmed": tracker_data.get("counts", {}).get("confirmed", 0),
            "tracker_provisional": tracker_data.get("counts", {}).get("provisional", 0),
            "filters": {
                **meta.get("filters", {}),
                "signal_tiers": ["high", "medium"],
                "sources": sorted({row.get("source", "") for row in raw_data if row.get("source")}),
                "event_tags": raw_event_tags,
                "strategy_tags": raw_strategy_tags,
                "sector_tags": raw_sectors,
                "quality_tags": sorted({*raw_quality_tags, *tracker_quality_tags}),
                "filer_roles": filer_roles,
                "campaign_statuses": campaign_statuses,
            },
        }
    )
    return meta


def main():
    raw_data = [enrich_raw_artifact(entry) for entry in read_json(DATA_PATH)]
    tracker_data = read_tracker_payload()
    tracker_data["campaigns"] = [enrich_campaign(campaign) for campaign in tracker_data.get("campaigns", [])]
    meta = build_meta(raw_data, tracker_data)
    write_json(DATA_PATH, raw_data)
    write_tracker_payloads(tracker_data)
    write_json(META_PATH, meta)
    print(f"Enriched {len(raw_data)} artifacts and {len(tracker_data.get('campaigns', []))} campaigns.")


if __name__ == "__main__":
    main()
