function activistColor(name) {
    if (!name) return "hsl(0, 0%, 55%)";
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = ((hash % 360) + 360) % 360;
    return `hsl(${h}, 40%, 34%)`;
}

const SOURCE_LABELS = {
    sec_edgar: "SEC EDGAR",
    sec_edgar_formtype: "EDGAR Discovery",
    sec_edgar_exhibit: "EDGAR Exhibit",
    fund_website: "Fund Site",
    recent_announcement: "Announcement",
    google_news: "Google News",
    prnewswire: "PR Newswire",
    businesswire: "BusinessWire",
    globenewswire: "GlobeNewswire",
    "10xebitda": "10xEBITDA",
    hedgefundalpha: "HFA",
    short_primary_publisher: "Primary Publisher",
};

const TYPE_LABELS = {
    activist_public_letter: "Letter",
    activist_stake_disclosure: "Stake",
    activist_campaign_demand: "Demand",
    activist_press_release: "Press",
    company_settlement: "Settlement",
    company_board_change: "Board",
    company_strategic_review: "Review",
};

const TAB_CONTENT_TYPES = {
    guide: "guide",
    all: null,
    presentations: "pdf_document",
    announcements: "announcement",
    filings: "filing",
    shorts: "shorts",
};

const TAB_SOURCES = {
    guide: [],
    all: ["10xebitda", "fund_website", "sec_edgar_exhibit", "sec_edgar", "sec_edgar_formtype", "google_news", "recent_announcement", "prnewswire", "businesswire", "globenewswire"],
    presentations: ["10xebitda", "fund_website", "sec_edgar_exhibit", "sec_edgar"],
    announcements: ["google_news", "recent_announcement", "prnewswire", "businesswire", "globenewswire"],
    filings: ["sec_edgar", "sec_edgar_formtype"],
    shorts: ["short_primary_publisher"],
};

const CONTENT_TYPE_LABELS = {
    pdf_document: "PDF",
    announcement: "News",
    filing: "Filing",
    shorts: "Short",
};

const LOGO_DEV_PUBLIC_KEY = "pk_CRncfgmFSHqcnJAsxeadog";
const LOGO_NAME_OVERRIDES = {
    "US Foods Holding Corp.": "US Foods",
    "LEE ENTERPRISES, Inc": "Lee Enterprises",
    "GRIFFON CORP": "Griffon",
    "BlackRock Innovation & Growth Term Trust": "BlackRock",
    "BLACKROCK CALIFORNIA MUNICIPAL INCOME TRUST": "BlackRock",
    "BLACKROCK MUNICIPAL INCOME TRUST": "BlackRock",
    "AMERISERV FINANCIAL INC /PA/": "AmeriServ Financial",
    "AMERISERV FINANCIAL INC": "AmeriServ Financial",
    "Multiple": "",
};

const TAB_DEFAULT_VIEW = {
    guide: "guide",
    all: "list",
    presentations: "list",
    announcements: "list",
    filings: "campaigns",
    shorts: "list",
};

// Tabs where signal tier filtering applies (others are already all-high-signal)
const SIGNAL_TIER_TABS = new Set(["filings", "all"]);
const TAB_DEFAULT_SIGNAL = {
    guide: "all",
    all: "high",
    presentations: "all",
    announcements: "all",
    filings: "high",
    shorts: "all",
};

let allData = [];
let activeTab = "presentations";
let activeShortsTab = "reports";
let activeSignalTier = TAB_DEFAULT_SIGNAL[activeTab];
let viewMode = TAB_DEFAULT_VIEW[activeTab];
let expandedId = null;
let expandedCampaigns = new Set();
let focusedIndex = -1;
let urlPinnedView = false;
let tickerCompanyMap = new Map();
let accessionTargetMap = new Map();

// Search mode state
let semanticMode = false;
let semanticResultIds = null;   // ordered array of IDs from last API call, or null
let semanticQuery = "";
let semanticLoading = false;
let ftsResultIds = null;        // ordered array of IDs from FTS search, or null

// Deploy mode state
let DEPLOY_MODE = false;
let deployMeta = null;

const SHORTS_TAB_OPTIONS = new Set(["reports", "signals"]);

function isShortRecord(d) {
    return (d.collection || "") === "shorts";
}

function getShortPublisher(d) {
    return d.publisher || d.activist || "Unknown Publisher";
}

function getShortArtifactLabel(d) {
    if (d.render_status === "native_pdf") return "PDF";
    if (d.render_status === "rendered_pdf") return "Rendered";
    if (d.render_status === "failed_render") return "Failed";
    if (d.short_item_type === "signal") return "Signal";
    return "Link";
}

function getShortArtifactDetail(d) {
    if (d.render_status === "native_pdf") return "Native PDF";
    if (d.render_status === "rendered_pdf") return "Rendered HTML PDF";
    if (d.render_status === "failed_render") return "HTML Render Failed";
    if (d.short_item_type === "signal") return "Link-Only Signal";
    return "HTML";
}

function stableId(d) {
    if (d.id) return d.id;
    const raw = [d.original_url, d.pdf_filename, d.activist, d.target_company, d.date, d.title]
        .filter(Boolean)
        .join("|");
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) + hash) + raw.charCodeAt(i);
        hash |= 0;
    }
    return `doc-${Math.abs(hash).toString(36)}-${raw.length.toString(36)}`;
}

const ReadingList = {
    KEY: "activist-reading-list",

    getIds() {
        try {
            const ids = JSON.parse(localStorage.getItem(this.KEY)) || [];
            return [...new Set(ids.filter(Boolean))];
        } catch {
            return [];
        }
    },

    save(ids) {
        const unique = [...new Set(ids.filter(Boolean))];
        localStorage.setItem(this.KEY, JSON.stringify(unique));
    },

    has(id) {
        return this.getIds().includes(id);
    },

    add(id) {
        if (!id) return;
        const ids = this.getIds();
        if (!ids.includes(id)) {
            ids.push(id);
            this.save(ids);
        }
    },

    remove(id) {
        this.save(this.getIds().filter(x => x !== id));
    },

    clear() {
        this.save([]);
    },

    toggle(id) {
        if (!id) return;
        if (this.has(id)) {
            this.remove(id);
        } else {
            this.add(id);
        }
        this.refresh();
    },

    getItems() {
        const ids = this.getIds();
        const map = new Map(allData.map(d => [d.id, d]));
        return ids.map(id => map.get(id)).filter(Boolean);
    },

    refresh() {
        this.updateUI();
        syncSaveButtons();
    },

    updateUI() {
        const items = this.getItems();
        const badge = document.getElementById("rl-badge");
        const body = document.getElementById("rl-body");
        const footer = document.getElementById("rl-footer");

        if (items.length) {
            badge.textContent = String(items.length);
            badge.style.display = "";
            footer.style.display = "";
        } else {
            badge.style.display = "none";
            footer.style.display = "none";
        }

        if (!items.length) {
            body.innerHTML = '<div class="rl-empty">No documents saved yet.</div>';
            return;
        }

        body.innerHTML = items.map(d => {
            const activist = getDisplayActivist(d);
            const target = getDisplayTarget(d);
            const title = getDisplayTitle(d);
            const link = pdfUrl(d);
            const linkLabel = d.pdf_filename ? "PDF" : "Link";
            return `
                <div class="rl-item" data-id="${escapeHtml(d.id)}">
                    <div class="rl-item-color" style="background:${activistColor(d.activist)}"></div>
                    <a class="rl-item-info" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">
                        <div class="rl-item-activist">${escapeHtml(activist)}</div>
                        <div class="rl-item-target">${escapeHtml(target)}</div>
                        <div class="rl-item-title">${escapeHtml(title)}</div>
                        <div class="rl-item-meta">
                            <span>${escapeHtml(formatDate(d.date))}</span>
                            <span class="rl-item-pdf">${escapeHtml(linkLabel)}</span>
                        </div>
                    </a>
                    <button class="rl-item-remove" data-id="${escapeHtml(d.id)}" title="Remove" aria-label="Remove">&times;</button>
                </div>
            `;
        }).join("");
    }
};

function openReadingListSidebar() {
    document.getElementById("reading-list-sidebar").classList.add("open");
    document.getElementById("rl-overlay").classList.add("open");
    ReadingList.updateUI();
}

function closeReadingListSidebar() {
    document.getElementById("reading-list-sidebar").classList.remove("open");
    document.getElementById("rl-overlay").classList.remove("open");
}

function extractCompanyFromFilename(raw) {
    if (!raw) return null;
    const letterMatch = raw.match(/Letter[_ ]to[_ ]([A-Z][A-Z0-9]+)/);
    if (letterMatch) return letterMatch[1];
    const boardMatch = raw.match(/Letter[_ ]to[_ ]([A-Za-z][A-Za-z0-9_ ]+?)[_ ](?:Board|CEO|Incoming|Executive)/);
    if (boardMatch) return boardMatch[1].replace(/[_]+/g, " ").trim();
    return null;
}

function cleanSecTarget(target) {
    if (!target) return "";
    let s = target.replace(/\s*\(CIK\s+\d+\)\s*/gi, "").trim();
    s = s.replace(/\s*\([A-Z][A-Z0-9, -]*\)\s*/g, "").trim();
    s = s.replace(/\s{2,}/g, " ");
    if (s === s.toUpperCase() && s.length > 3) {
        s = s.replace(/\b\w+/g, w => w.charAt(0) + w.slice(1).toLowerCase());
        s = s.replace(/\bInc\b/g, "Inc.").replace(/\bCorp\b/g, "Corp.");
        s = s.replace(/\bLtd\b/g, "Ltd.").replace(/\bLlc\b/g, "LLC");
        s = s.replace(/\bLp\b/g, "LP");
    }
    return s.trim();
}

function humanizeFilename(raw) {
    if (!raw) return "";
    let s = raw.replace(/\.\w{1,5}$/, "");
    s = s.replace(/^[a-f0-9]{8,}--[a-z0-9-]+--/, "");
    s = s.replace(/[_]+/g, " ").replace(/-+/g, " ").trim();
    s = s.replace(/\s+\d{2,4}[\.\s]\d{2}[\.\s]\d{2,4}\s*$/, "").trim();
    s = s.replace(/\s+\d{4}\s*\d{2}\s*\d{2}\s*$/, "").trim();
    s = s.replace(/\b\w/g, c => c.toUpperCase());
    s = s.replace(/\bLp\b/g, "LP").replace(/\bLlc\b/g, "LLC").replace(/\bCeo\b/g, "CEO");
    return s || raw;
}

function extractSecAccession(url) {
    const match = (url || "").match(/\/([0-9]{18})\//);
    return match ? match[1] : "";
}

function normalizeCompanyName(name) {
    if (!name) return "";
    return cleanSecTarget(name)
        .replace(/\s{2,}/g, " ")
        .trim();
}

function buildTickerCompanyMap(data) {
    const map = new Map();
    const register = (ticker, company) => {
        const cleanTicker = (ticker || "").toUpperCase().replace(/^[A-Z]+:/, "").trim();
        const cleanCompany = normalizeCompanyName(company);
        if (!cleanTicker || cleanTicker.length > 5 || !cleanCompany) return;
        if (/\b(TRUST|FUND|ETF|ETN)\b/i.test(cleanCompany)) return;
        if (!map.has(cleanTicker)) map.set(cleanTicker, cleanCompany);
    };

    data.forEach(d => {
        const target = normalizeCompanyName(d.target_company || "");
        const title = d.title || "";
        if (!target) return;

        const targetParen = target.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
        if (targetParen) {
            const company = normalizeCompanyName(targetParen[1]);
            targetParen[2].split(",").forEach(token => register(token, company));
        }

        for (const match of title.matchAll(/\(([A-Z]+:)?([A-Z]{1,5})\)/g)) {
            register(match[2], target);
        }
    });

    return map;
}

function resolveTickerTarget(symbol) {
    const clean = (symbol || "").toUpperCase().trim();
    return tickerCompanyMap.get(clean) || "";
}

function extractTickerCandidate(text) {
    if (!text) return "";
    const paren = text.match(/\((?:[A-Z]+:)?([A-Z]{1,5})\)/);
    if (paren) return paren[1];
    const bare = text.match(/\b([A-Z]{1,5})\b/);
    return bare ? bare[1] : "";
}

function buildAccessionTargetMap(data) {
    const map = new Map();
    data.forEach(d => {
        if (!["sec_edgar", "sec_edgar_formtype"].includes(d.source)) return;
        const accession = extractSecAccession(d.original_url);
        const target = normalizeCompanyName(d.target_company || "");
        if (!accession || !target) return;
        map.set(accession, target);
    });
    return map;
}

function getActivistRecords() {
    return allData.filter(d => !isShortRecord(d));
}

function inferFundWebsiteTarget(d) {
    const title = d.title || "";
    const originalUrl = d.original_url || "";
    const basename = originalUrl.split("/").pop() || "";

    const titlePatterns = [
        /Perspectives on (.+?)(?: and its.*)?$/i,
        /Letter[_ ]to[_ ]([A-Z]{1,5})(?:[_ ]|$)/i,
        /Letter to ([A-Z]{1,5})(?:\b| )/i,
    ];

    for (const pattern of titlePatterns) {
        const match = title.match(pattern) || basename.match(pattern);
        if (!match) continue;
        const candidate = (match[1] || "").replace(/[_]+/g, " ").trim();
        if (/^[A-Z]{1,5}$/.test(candidate)) {
            const resolved = resolveTickerTarget(candidate);
            if (resolved) return resolved;
        }
        if (candidate.length > 3) return candidate;
    }

    const tickerMatch = (title.match(/\b([A-Z]{1,5})\b/) || basename.match(/\b([A-Z]{1,5})\b/));
    if (tickerMatch) {
        const resolved = resolveTickerTarget(tickerMatch[1]);
        if (resolved) return resolved;
    }

    return "";
}

function inferExhibitTarget(d) {
    const accession = extractSecAccession(d.original_url);
    if (accession && accessionTargetMap.has(accession)) {
        return accessionTargetMap.get(accession);
    }
    return "";
}

function looksSluggyTarget(target) {
    if (!target) return true;
    if (target.includes("_")) return true;
    if (/^[a-z0-9_-]+$/i.test(target) && /[0-9]/.test(target)) return true;
    if (/^(ex|dfan|form)\b/i.test(target)) return true;
    if (target.length <= 4 && /^[A-Z]{1,4}$/.test(target)) return true;
    return false;
}

function getDisplayTitle(d) {
    const title = d.title || "";
    if (/^EX-\d/i.test(title) || (d.source === "sec_edgar_exhibit" && /^ex\d|^ex-|^ex1|^ex99|^p\d|^ea\d/i.test(title))) {
        const target = d.target_company || d.form_type || "SEC Filing";
        return `Exhibit — ${target}`;
    }
    const isFilename = /[_]{2,}/.test(title) || /^\w+_\w+_\w+/.test(title);
    if (title && !isFilename) return title;
    if (title) {
        const humanized = humanizeFilename(title);
        if (humanized && humanized.length > 3) return humanized;
    }
    return d.form_type || "Filing";
}

function getDisplayActivist(d) {
    if (isShortRecord(d)) return getShortPublisher(d);
    const activist = d.activist || "";
    const wordCount = activist.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 5 || /\b(surges?|jumps?|pushes?|demands?|builds?|exits?|reports?|faces?|says?|aims?)\b/i.test(activist)) {
        return SOURCE_LABELS[d.source] || "News";
    }
    return activist || "Unknown";
}

function getDisplayTarget(d) {
    const target = d.target_company || "";
    if (isShortRecord(d) && (!target || target === "Unknown") && d.target_ticker) {
        return d.target_ticker;
    }
    if (/^[A-Z]{1,5}$/.test(target.trim())) {
        const resolved = resolveTickerTarget(target.trim());
        if (resolved) return resolved;
    }
    if (d.source === "google_news" && target) {
        const ticker = extractTickerCandidate(target) || extractTickerCandidate(d.title || "");
        if (ticker) {
            const resolved = resolveTickerTarget(ticker);
            if (resolved) return resolved;
        }
    }
    if (d.source === "fund_website") {
        const inferred = inferFundWebsiteTarget(d);
        if (inferred) return inferred;
    }
    if (d.source === "sec_edgar_exhibit" && looksSluggyTarget(target)) {
        const inferred = inferExhibitTarget(d);
        if (inferred) return inferred;
    }
    if (target.includes("_")) {
        const company = extractCompanyFromFilename(target);
        if (company) {
            if (/^[A-Z]{1,5}$/.test(company)) {
                const resolved = resolveTickerTarget(company);
                if (resolved) return resolved;
            }
            return company;
        }
        return humanizeFilename(target) || "General / Portfolio";
    }
    if (/CIK/i.test(target)) return cleanSecTarget(target);
    if (/^and\s/i.test(target)) return target.replace(/^and\s+/i, "").trim() || "General / Portfolio";
    if (looksSluggyTarget(target)) {
        const inferred = d.source === "sec_edgar_exhibit" ? inferExhibitTarget(d) : "";
        if (inferred) return inferred;
    }
    return target || "General / Portfolio";
}

function getLogoLookupName(d) {
    const target = getDisplayTarget(d);
    if (!target || target === "General / Portfolio") return "";
    if (Object.prototype.hasOwnProperty.call(LOGO_NAME_OVERRIDES, target)) {
        return LOGO_NAME_OVERRIDES[target];
    }
    let cleaned = target;
    cleaned = cleaned.replace(/\s*\/[A-Z]{2,}(?=\s|\(|$).*$/i, "").trim();
    cleaned = cleaned.replace(/\s*\((?:[A-Z]+:)?[A-Z0-9]{1,5}(?:\s*,\s*[A-Z0-9]{1,5})*\)\s*$/g, "").trim();
    cleaned = cleaned.replace(/\bPLC\b/gi, "plc");
    cleaned = cleaned.replace(/\bINC\b/gi, "Inc");
    cleaned = cleaned.replace(/\bCORP\b/gi, "Corp");
    cleaned = cleaned.replace(/\bCO\b/gi, "Co");
    cleaned = cleaned.replace(/\s{2,}/g, " ").trim();
    return cleaned;
}

function titleCaseWord(word) {
    if (!word) return "";
    if (/[a-z]/.test(word)) return word;
    return word.charAt(0) + word.slice(1).toLowerCase();
}

function getLogoLookupCandidates(d) {
    const base = getLogoLookupName(d);
    if (!base) return [];

    const candidates = [];
    const push = (value) => {
        const cleaned = (value || "").replace(/\s{2,}/g, " ").trim();
        if (!cleaned) return;
        if (!candidates.includes(cleaned)) candidates.push(cleaned);
    };

    push(base);

    const withoutLegal = base
        .replace(/,?\s+\b(Inc\.?|Corp\.?|Corporation|Co\.?|Company|Holdings?|Group|Plc)\b\.?$/i, "")
        .trim();
    push(withoutLegal);

    const trustLike = /\b(TRUST|FUND|REIT|ETF|ETN)\b/i.test(base);
    const words = base.split(/\s+/).filter(Boolean);
    if (trustLike && words.length) {
        push(titleCaseWord(words[0]));
        if (words.length > 1) push(`${titleCaseWord(words[0])} ${titleCaseWord(words[1])}`);
    }

    if (words.length && /^[A-Z][A-Z&.-]+$/.test(words[0])) {
        push(titleCaseWord(words[0]));
    }

    return candidates;
}

function isHighConfidenceLogoTarget(d) {
    const target = getLogoLookupCandidates(d)[0] || "";
    if (!target) return false;
    if (/^[A-Z]{1,5}$/.test(target)) return true;
    if (target.length < 3) return false;
    if (/\.\.\./.test(target)) return false;
    if (/\b(CIK|CUSIP|SERIES|CLASS|PORTFOLIO|HOLDINGS?)\b/i.test(target)) return false;
    if (/\b(SPV|SPAC|ROYALTY|PARTNERS?|PARTNERSHIPS?|VENTURES?)\b/i.test(target)) return false;
    if (/\b(LP|L\.P\.|LLC|L\.L\.C\.|LLP|L\.L\.P\.|PLC|PTE|LTD|S\.A\.|N\.V\.|B\.V\.)\b/i.test(target)) return false;
    if (/^(THE )?[A-Z]\.\.\.$/.test(target)) return false;

    const words = target.split(/\s+/).filter(Boolean);
    if (!words.length) return false;
    if (words.length === 1 && words[0].length <= 3) return false;

    return true;
}

function getLogoUrl(d) {
    if (!isHighConfidenceLogoTarget(d)) return "";
    const lookup = getLogoLookupCandidates(d)[0] || "";
    if (!lookup) return "";
    return `https://img.logo.dev/name/${encodeURIComponent(lookup)}?token=${encodeURIComponent(LOGO_DEV_PUBLIC_KEY)}&size=40&retina=true&format=png&theme=auto&fallback=404`;
}

function renderLogoSlot(d) {
    const candidates = isHighConfidenceLogoTarget(d)
        ? getLogoLookupCandidates(d).map(name => `https://img.logo.dev/name/${encodeURIComponent(name)}?token=${encodeURIComponent(LOGO_DEV_PUBLIC_KEY)}&size=40&retina=true&format=png&theme=auto&fallback=404`)
        : [];
    if (!candidates.length) return '<span class="target-logo-slot is-empty" aria-hidden="true"></span>';
    return `
        <span class="target-logo-slot">
            <img class="target-logo" src="${escapeHtml(candidates[0])}" data-urls="${escapeHtml(candidates.join("|"))}" data-url-index="0" alt="" loading="lazy" referrerpolicy="origin" onload="this.parentElement.classList.add('is-loaded')" onerror="const urls=(this.dataset.urls||'').split('|').filter(Boolean); const next=Number(this.dataset.urlIndex||0)+1; if (next < urls.length) { this.dataset.urlIndex=String(next); this.src=urls[next]; } else { this.parentElement.classList.add('is-empty'); this.remove(); }">
        </span>
    `;
}

function formatDate(dateStr) {
    if (!dateStr) return "Undated";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const m = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        return `${months[m - 1] || parts[1]} ${day}, ${parts[0]}`;
    }
    return dateStr;
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
}

function pdfAssetPath(d) {
    if (!d.pdf_filename) return "";
    const baseDir = isShortRecord(d) ? "shorts/pdfs" : "pdfs";
    return buildAssetPath(`${baseDir}/${encodeURIComponent(d.pdf_filename)}`);
}

function pdfUrl(d) {
    if (!DEPLOY_MODE && d.pdf_filename) return pdfAssetPath(d);
    return d.original_url || "#";
}

function buildAssetPath(suffix) {
    const path = window.location.pathname || "/";
    const inWebsiteDir = path.includes("/website/");
    const atWebsiteRoot = !inWebsiteDir;
    if (inWebsiteDir) return `/data/${suffix}`;
    if (atWebsiteRoot) return `../data/${suffix}`;
    return `../data/${suffix}`;
}

async function fetchJsonFile(suffix) {
    const candidatePaths = [
        buildAssetPath(suffix),
        `/data/${suffix}`,
        `../data/${suffix}`,
    ];

    for (const candidate of [...new Set(candidatePaths)]) {
        try {
            const attempt = await fetch(candidate);
            if (!attempt.ok) continue;
            return await attempt.json();
        } catch (err) {
            // Keep trying other candidate roots.
        }
    }
    return null;
}

function inferContentType(d) {
    if ((d.collection || "") === "shorts") return "shorts";
    if (d.content_type) return d.content_type;
    if (d.pdf_filename) return "pdf_document";
    if (d.source === "sec_edgar_exhibit") return "pdf_document";
    if (d.source === "10xebitda" || d.source === "fund_website") return "pdf_document";
    if (d.source === "google_news" || d.source === "recent_announcement") return "announcement";
    return "filing";
}

function getMarkerLabel(d) {
    if (activeTab === "shorts") return getShortArtifactLabel(d);
    if (activeTab === "announcements") return TYPE_LABELS[d.announcement_type] || "News";
    if (activeTab === "all") return TYPE_LABELS[d.announcement_type] || CONTENT_TYPE_LABELS[d.content_type] || "Item";
    if (activeTab === "filings" && viewMode === "list") return SOURCE_LABELS[d.source] || "Filing";
    return "";
}

function toggleFilterPanel(force) {
    const panel = document.getElementById("filter-panel");
    const btn = document.getElementById("toggle-filters");
    const shouldOpen = typeof force === "boolean" ? force : panel.classList.contains("collapsed");
    panel.classList.toggle("collapsed", !shouldOpen);
    btn.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
}

async function loadData() {
    const container = document.getElementById("list-container");
    performance.mark("data-load-start");

    // Probe for deploy meta — if it exists, we're in static deploy mode
    try {
        const metaResp = await fetch(buildAssetPath("meta.json"));
        if (metaResp.ok) {
            DEPLOY_MODE = true;
            deployMeta = await metaResp.json();
            container.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Loading ${deployMeta.record_count.toLocaleString()} records...</p></div>`;
        }
    } catch (e) { /* not in deploy mode */ }

    if (!DEPLOY_MODE) {
        container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading data...</p></div>';
    }

    try {
        const activistData = await fetchJsonFile("data.json");
        const shortsData = await fetchJsonFile("shorts/shorts.json");
        if (!activistData && !shortsData) {
            throw new Error("No activist or shorts dataset found from this server root.");
        }
        allData = [...(activistData || []), ...(shortsData || [])];
        allData.forEach(d => {
            d.collection = d.collection || "activist";
            d.id = stableId(d);
            d.content_type = inferContentType(d);
        });
        tickerCompanyMap = buildTickerCompanyMap(allData);
        accessionTargetMap = buildAccessionTargetMap(allData);
        performance.mark("data-load-end");
        performance.measure("data-load", "data-load-start", "data-load-end");
        console.debug(`[perf] data-load: ${performance.getEntriesByName("data-load")[0].duration.toFixed(0)}ms`);
        populateFilters();
        updateTabCounts();
        readUrlState();
        render();
        ReadingList.updateUI();
    } catch (e) {
        container.innerHTML = `
            <div class="empty-state">
                ${escapeHtml(e.message)}<br><br>
                Run <code>python3 scraper/run_scrape.py</code> for activist data and <code>python3 scraper/run_shorts_scrape.py</code> for shorts, then serve the repo root and open <code>/website/</code>.
            </div>
        `;
    }
}

function populateFilters() {
    performance.mark("filters-start");
    const activistSelect = document.getElementById("activist-filter");
    const sectorSelect = document.getElementById("sector-filter");

    if (deployMeta?.filters) {
        // Use precomputed filter data from meta.json
        deployMeta.filters.activists.forEach(a => {
            const opt = document.createElement("option");
            opt.value = a;
            opt.textContent = a;
            activistSelect.appendChild(opt);
        });
        Object.entries(deployMeta.filters.sectors).forEach(([s, count]) => {
            const opt = document.createElement("option");
            opt.value = s;
            opt.textContent = `${s} (${count})`;
            sectorSelect.appendChild(opt);
        });
    } else {
        // Compute from data
        const activistRecords = getActivistRecords();
        const activists = [...new Set(
            activistRecords
                .filter(d => d.source !== "google_news")
                .map(d => d.activist)
                .filter(Boolean)
        )].sort();
        activists.forEach(a => {
            const opt = document.createElement("option");
            opt.value = a;
            opt.textContent = a;
            activistSelect.appendChild(opt);
        });

        const sectors = {};
        activistRecords.forEach(d => {
            const sector = d.sector || "Unknown";
            sectors[sector] = (sectors[sector] || 0) + 1;
        });
        Object.keys(sectors).sort().forEach(s => {
            const opt = document.createElement("option");
            opt.value = s;
            opt.textContent = `${s} (${sectors[s]})`;
            sectorSelect.appendChild(opt);
        });
    }

    updateSourceFilter();
    performance.mark("filters-end");
    performance.measure("populate-filters", "filters-start", "filters-end");
    console.debug(`[perf] populate-filters: ${performance.getEntriesByName("populate-filters").pop().duration.toFixed(0)}ms`);
}

function updateSourceFilter() {
    if (activeTab === "guide") return;
    const sourceSelect = document.getElementById("source-filter");
    const currentVal = sourceSelect.value;
    while (sourceSelect.options.length > 1) sourceSelect.remove(1);

    const relevantSources = TAB_SOURCES[activeTab] || [];
    const contentType = TAB_CONTENT_TYPES[activeTab];
    const sourceCounts = {};

    allData.forEach(d => {
        const isShort = isShortRecord(d);
        if (activeTab === "shorts") {
            if (!isShort) return;
        } else if (isShort) {
            return;
        }
        if (contentType !== null && d.content_type !== contentType) return;
        const s = d.source || "other";
        sourceCounts[s] = (sourceCounts[s] || 0) + 1;
    });

    [...new Set([...relevantSources, ...Object.keys(sourceCounts)])].forEach(s => {
        if (!sourceCounts[s]) return;
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = `${SOURCE_LABELS[s] || s} (${sourceCounts[s]})`;
        sourceSelect.appendChild(opt);
    });

    if (currentVal) {
        sourceSelect.value = currentVal;
        if (sourceSelect.value !== currentVal) sourceSelect.value = "";
    }
}

function updateTabCounts() {
    const counts = { presentations: 0, announcements: 0, filings: 0, shorts: 0 };
    allData.forEach(d => {
        if (isShortRecord(d)) {
            counts.shorts++;
            return;
        }
        if (d.content_type === "pdf_document") counts.presentations++;
        else if (d.content_type === "announcement") counts.announcements++;
        else counts.filings++;
    });
    document.getElementById("tab-count-all").textContent = (counts.presentations + counts.announcements + counts.filings).toLocaleString();
    document.getElementById("tab-count-presentations").textContent = counts.presentations.toLocaleString();
    document.getElementById("tab-count-announcements").textContent = counts.announcements.toLocaleString();
    document.getElementById("tab-count-filings").textContent = counts.filings.toLocaleString();
    document.getElementById("tab-count-shorts").textContent = counts.shorts.toLocaleString();
}

function setViewButtons(mode) {
    document.getElementById("view-list").classList.toggle("active", mode === "list");
    document.getElementById("view-campaigns").classList.toggle("active", mode === "campaigns");
}

function setShortsViewButtons(mode) {
    document.getElementById("shorts-reports").classList.toggle("active", mode === "reports");
    document.getElementById("shorts-signals").classList.toggle("active", mode === "signals");
}

function syncToolbarState() {
    const shortsTabs = document.getElementById("shorts-subtabs");
    const viewGroup = document.querySelector(".view-group[aria-label='View mode']");
    const filtersButton = document.getElementById("toggle-filters");
    const filterPanel = document.getElementById("filter-panel");
    const searchInput = document.getElementById("search-input");
    const sortByParty = document.getElementById("sort-by-party");

    const signalTabs = document.getElementById("signal-tier-tabs");
    const shortsMode = activeTab === "shorts";
    shortsTabs.style.display = shortsMode ? "inline-flex" : "none";
    viewGroup.style.display = shortsMode ? "none" : "inline-flex";
    filtersButton.style.display = shortsMode ? "none" : "inline-flex";
    sortByParty.textContent = shortsMode ? "By Publisher" : "By Activist";
    if (semanticMode) {
        searchInput.placeholder = shortsMode
            ? "e.g. short squeeze thesis on pharma — Enter to search"
            : "e.g. board seat fight at a retailer — Enter to search";
    } else {
        searchInput.placeholder = shortsMode
            ? "Hindenburg, Viceroy, ticker, target..."
            : "Elliott, proxy fight, DFAN14A, Starbucks...";
    }
    if (shortsMode) toggleFilterPanel(false);
    if (activeTab === "guide") {
        shortsTabs.style.display = "none";
        viewGroup.style.display = "none";
        filtersButton.style.display = "none";
    }
    if (signalTabs) {
        const showSignal = SIGNAL_TIER_TABS.has(activeTab);
        signalTabs.style.display = showSignal ? "inline-flex" : "none";
        if (showSignal) syncSignalTierButtons();
    }
}

function syncSignalTierButtons() {
    document.querySelectorAll(".signal-tier-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.tier === activeSignalTier);
    });
}

function readUrlState() {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && Object.prototype.hasOwnProperty.call(TAB_CONTENT_TYPES, tab)) {
        activeTab = tab;
    }
    const shortsView = params.get("shorts");
    if (shortsView && SHORTS_TAB_OPTIONS.has(shortsView)) {
        activeShortsTab = shortsView;
    }
    const tierParam = params.get("signal");
    if (tierParam && ["high", "medium", "low", "all"].includes(tierParam)) {
        activeSignalTier = tierParam;
    } else {
        activeSignalTier = TAB_DEFAULT_SIGNAL[activeTab] || "all";
    }

    if (params.get("activist")) document.getElementById("activist-filter").value = params.get("activist");
    if (params.get("source")) document.getElementById("source-filter").value = params.get("source");
    if (params.get("type")) document.getElementById("type-filter").value = params.get("type");
    if (params.get("sector")) document.getElementById("sector-filter").value = params.get("sector");
    if (params.get("q")) document.getElementById("search-input").value = params.get("q");
    if (params.get("sort")) document.getElementById("sort-select").value = params.get("sort");

    urlPinnedView = params.has("view");
    const requestedView = params.get("view");
    if (activeTab === "shorts" || activeTab === "guide") {
        urlPinnedView = false;
        viewMode = TAB_DEFAULT_VIEW[activeTab];
    } else {
        viewMode = (requestedView === "campaigns" || requestedView === "list")
            ? requestedView
            : TAB_DEFAULT_VIEW[activeTab];
    }

    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.tab === activeTab);
    });
    setViewButtons(viewMode);
    setShortsViewButtons(activeShortsTab);
    updateSourceFilter();
    syncToolbarState();
}

function writeUrlState() {
    const params = new URLSearchParams();
    const activist = document.getElementById("activist-filter").value;
    const source = document.getElementById("source-filter").value;
    const type = document.getElementById("type-filter").value;
    const sector = document.getElementById("sector-filter").value;
    const search = document.getElementById("search-input").value.trim();
    const sort = document.getElementById("sort-select").value;

    if (activeTab !== "presentations") params.set("tab", activeTab);
    if (activeTab === "shorts" && activeShortsTab !== "reports") params.set("shorts", activeShortsTab);
    if (activeTab !== "shorts" && activeTab !== "guide") {
        if (activist) params.set("activist", activist);
        if (source) params.set("source", source);
        if (type) params.set("type", type);
        if (sector) params.set("sector", sector);
    }
    if (search) params.set("q", search);
    if (sort !== "date-desc") params.set("sort", sort);
    if (activeTab !== "shorts" && activeTab !== "guide" && viewMode !== TAB_DEFAULT_VIEW[activeTab]) {
        params.set("view", viewMode);
    }
    if (SIGNAL_TIER_TABS.has(activeTab) && activeSignalTier !== TAB_DEFAULT_SIGNAL[activeTab]) {
        params.set("signal", activeSignalTier);
    }

    const qs = params.toString();
    history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
}

function setViewMode(mode, persistPinnedView = false) {
    if (activeTab === "guide" || activeTab === "shorts") return;
    viewMode = mode;
    if (persistPinnedView) urlPinnedView = true;
    setViewButtons(mode);
    expandedId = null;
    expandedCampaigns.clear();
    render();
}

function setActiveTab(tab, doRender = true) {
    activeTab = tab;
    activeSignalTier = TAB_DEFAULT_SIGNAL[tab] || "all";
    semanticResultIds = null;
    semanticQuery = "";
    ftsResultIds = null;
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.tab === tab);
    });
    expandedId = null;
    expandedCampaigns.clear();
    updateSourceFilter();
    if (tab === "shorts") {
        urlPinnedView = false;
        activeShortsTab = "reports";
        viewMode = TAB_DEFAULT_VIEW[tab];
        setShortsViewButtons(activeShortsTab);
        setViewButtons(viewMode);
    } else if (tab === "guide") {
        urlPinnedView = false;
        viewMode = TAB_DEFAULT_VIEW[tab];
        setViewButtons(viewMode);
    } else if (!urlPinnedView) {
        viewMode = TAB_DEFAULT_VIEW[tab];
        setViewButtons(viewMode);
    }
    syncToolbarState();
    if (doRender) render();
}

function setActiveShortsTab(tab) {
    if (!SHORTS_TAB_OPTIONS.has(tab)) return;
    activeShortsTab = tab;
    setShortsViewButtons(tab);
    expandedId = null;
    expandedCampaigns.clear();
    render();
}

function getFiltered() {
    performance.mark("filter-start");
    const contentType = TAB_CONTENT_TYPES[activeTab];
    const expectedShortType = activeShortsTab === "signals" ? "signal" : "report";
    const activist = document.getElementById("activist-filter").value;
    const source = document.getElementById("source-filter").value;
    const type = document.getElementById("type-filter").value;
    const sector = document.getElementById("sector-filter").value;
    const search = document.getElementById("search-input").value.toLowerCase();
    const sort = document.getElementById("sort-select").value;

    // Build rank maps for server-side search results (semantic or FTS)
    const semanticRankMap = semanticMode && semanticResultIds
        ? new Map(semanticResultIds.map((id, i) => [id, i]))
        : null;
    const ftsRankMap = !semanticMode && ftsResultIds
        ? new Map(ftsResultIds.map((id, i) => [id, i]))
        : null;

    const filtered = allData.filter(d => {
        if (activeTab === "shorts") {
            if (!isShortRecord(d)) return false;
            if ((d.short_item_type || "") !== expectedShortType) {
                return false;
            }
        } else {
            if (isShortRecord(d)) return false;
        }

        if (contentType !== null && d.content_type !== contentType) return false;
        if (activeTab !== "shorts") {
            if (activist && d.activist !== activist) return false;
            if (source && d.source !== source) return false;
            if (type && d.announcement_type !== type) return false;
            if (sector) {
                const docSector = d.sector || "Unknown";
                if (docSector !== sector) return false;
            }
        }
        if (SIGNAL_TIER_TABS.has(activeTab) && activeSignalTier !== "all") {
            if ((d.signal_tier || "low") !== activeSignalTier) return false;
        }
        // Server-side search results (semantic or FTS) — only show matched records
        if (semanticRankMap) return semanticRankMap.has(d.id);
        if (ftsRankMap) return ftsRankMap.has(d.id);
        if (search) {
            const haystack = `${d.activist} ${d.publisher || ""} ${d.target_company} ${d.target_ticker || ""} ${d.title} ${d.form_type} ${d.announcement_type || ""} ${d.render_status || ""}`.toLowerCase();
            if (!haystack.includes(search)) return false;
        }
        return true;
    });

    if (semanticRankMap) {
        filtered.sort((a, b) => (semanticRankMap.get(a.id) ?? 999) - (semanticRankMap.get(b.id) ?? 999));
    } else if (ftsRankMap) {
        filtered.sort((a, b) => (ftsRankMap.get(a.id) ?? 999) - (ftsRankMap.get(b.id) ?? 999));
    } else {
        filtered.sort((a, b) => {
            if (sort === "date-desc") return (b.date || "").localeCompare(a.date || "");
            if (sort === "date-asc") return (a.date || "").localeCompare(b.date || "");
            if (sort === "activist") {
                const left = activeTab === "shorts" ? getShortPublisher(a) : (a.activist || "");
                const right = activeTab === "shorts" ? getShortPublisher(b) : (b.activist || "");
                return left.localeCompare(right);
            }
            return 0;
        });
    }
    performance.mark("filter-end");
    performance.measure("filter", "filter-start", "filter-end");
    return filtered;
}

async function runSemanticSearch(query) {
    if (!query.trim()) {
        semanticResultIds = null;
        semanticQuery = "";
        render();
        return;
    }
    semanticLoading = true;
    semanticQuery = query;
    updateSemanticUI();
    render();
    try {
        // In deploy mode, use serverless FTS; locally, use the Python API
        const endpoint = DEPLOY_MODE
            ? `/api/search?q=${encodeURIComponent(query)}&k=50&mode=semantic`
            : `/api/search?q=${encodeURIComponent(query)}&k=50`;
        const resp = await fetch(endpoint);
        if (!resp.ok) throw new Error(`Search API returned ${resp.status}`);
        const data = await resp.json();
        semanticResultIds = data.results.map(r => r.id);
    } catch (err) {
        console.error("Semantic search error:", err);
        semanticResultIds = null;
        const bar = document.getElementById("stats-bar");
        if (bar) bar.innerHTML = `<span class="stat-item" style="color:var(--danger,#c00)">Search unavailable</span>`;
    }
    semanticLoading = false;
    updateSemanticUI();
    render();
}

async function runFtsSearch(query) {
    if (!query.trim()) {
        ftsResultIds = null;
        render();
        return;
    }
    semanticLoading = true;
    updateSemanticUI();
    render();
    try {
        // In deploy mode, use serverless FTS; locally, use the Python API
        const endpoint = DEPLOY_MODE
            ? `/api/search?q=${encodeURIComponent(query)}&k=100&mode=fts`
            : `/api/fts?q=${encodeURIComponent(query)}&k=100`;
        const resp = await fetch(endpoint);
        if (!resp.ok) throw new Error(`FTS API returned ${resp.status}`);
        const data = await resp.json();
        ftsResultIds = data.results.map(r => r.id);
    } catch (err) {
        console.error("FTS search error:", err);
        ftsResultIds = null;
    }
    semanticLoading = false;
    updateSemanticUI();
    render();
}

function updateSemanticUI() {
    const toggle = document.getElementById("semantic-toggle");
    if (!toggle) return;
    toggle.classList.toggle("active", semanticMode);
    toggle.textContent = semanticLoading ? "Searching…" : semanticMode ? "Semantic" : "Keyword";
    // Placeholder is set by syncToolbarState (called from render)
}

function updateStats(filtered) {
    if (activeTab === "guide") {
        document.getElementById("stats-bar").innerHTML = "";
        document.getElementById("header-stats").textContent = `${allData.length} records · ${new Set(allData.filter(d => !isShortRecord(d)).map(d => d.activist).filter(Boolean)).size} activists`;
        return;
    }
    const uniqueActivists = new Set(filtered.map(d => activeTab === "shorts" ? getShortPublisher(d) : d.activist).filter(Boolean)).size;
    const uniqueTargets = new Set(filtered.map(d => d.target_company).filter(Boolean)).size;
    const pdfCount = filtered.filter(d => d.pdf_filename).length;
    const bar = document.getElementById("stats-bar");
    const statLabel = activeTab === "shorts" ? "publishers" : "activists";
    const extraShortsStats = activeTab === "shorts"
        ? [
            `<span class="stat-item"><strong>${filtered.filter(d => d.validation_state === "validated").length}</strong> validated</span>`,
            `<span class="stat-item"><strong>${filtered.filter(d => d.render_status === "rendered_pdf").length}</strong> rendered PDFs</span>`,
        ]
        : [];
    const statItems = [
        `<span class="stat-item"><strong>${filtered.length}</strong> results</span>`,
        `<span class="stat-item"><strong>${uniqueActivists}</strong> ${statLabel}</span>`,
        `<span class="stat-item"><strong>${uniqueTargets}</strong> targets</span>`,
    ];
    if (!DEPLOY_MODE && pdfCount > 0) {
        statItems.push(`<span class="stat-item"><strong>${pdfCount}</strong> local PDFs</span>`);
    }
    statItems.push(...extraShortsStats);
    bar.innerHTML = statItems.join("");

    const activistCount = new Set(getActivistRecords().map(d => d.activist).filter(Boolean)).size;
    const shortPublisherCount = new Set(allData.filter(isShortRecord).map(getShortPublisher).filter(Boolean)).size;
    const headerStats = document.getElementById("header-stats");
    headerStats.textContent = activeTab === "shorts"
        ? `${allData.length} records · ${shortPublisherCount} short publishers`
        : `${allData.length} records · ${activistCount} activists`;
}

function bookmarkSvg(filled) {
    return `<svg width="14" height="14" viewBox="0 0 16 16" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.5"><path d="M3 2h10a1 1 0 011 1v11l-6-3-6 3V3a1 1 0 011-1z"/></svg>`;
}

function markerChip(label) {
    if (!label) return "";
    return `<span class="marker-chip">${escapeHtml(label)}</span>`;
}

function renderSaveButton(id, withLabel = false) {
    const saved = ReadingList.has(id);
    const cls = withLabel ? "detail-save-btn" : "row-save-btn";
    return `
        <button class="${cls}${saved ? " saved" : ""}" data-id="${escapeHtml(id)}" title="${saved ? "Remove from reading list" : "Add to reading list"}" aria-label="${saved ? "Remove from reading list" : "Add to reading list"}">
            ${bookmarkSvg(saved)}
            ${withLabel ? `<span class="detail-save-label">${saved ? "Saved" : "Save"}</span>` : ""}
        </button>
    `;
}

function buildShortsDetailCard(d) {
    const title = getDisplayTitle(d);
    const target = getDisplayTarget(d);
    const primaryLabel = d.pdf_filename ? "Open PDF" : "View Source";
    const primaryLink = pdfUrl(d);
    const sourcePageUrl = d.pdf_filename
        ? (d.source_page_url || d.original_url || "")
        : (d.source_page_url && d.source_page_url !== d.original_url ? d.source_page_url : "");
    const publisherPageLabel = d.render_status === "rendered_pdf" ? "Original Article" : "Publisher Page";
    const localPdfStatus = d.pdf_filename ? "Stored locally" : "Link only";
    const itemType = d.short_item_type === "report" ? "Report" : "Signal";
    return `
        <div class="detail-card">
            <div class="detail-head">
                <div>
                    <div class="detail-kicker">${escapeHtml(getShortPublisher(d))} / ${escapeHtml(target)}</div>
                    <div class="detail-title">${escapeHtml(title)}</div>
                </div>
                ${renderSaveButton(d.id, true)}
            </div>
            <div class="detail-grid">
                <div>
                    <span class="detail-field-label">Publish Date</span>
                    <span class="detail-field-value">${escapeHtml(formatDate(d.date))}</span>
                </div>
                <div>
                    <span class="detail-field-label">Publisher</span>
                    <span class="detail-field-value">${escapeHtml(getShortPublisher(d))}</span>
                </div>
                <div>
                    <span class="detail-field-label">Ticker</span>
                    <span class="detail-field-value">${escapeHtml(d.target_ticker || "—")}</span>
                </div>
                <div>
                    <span class="detail-field-label">Artifact</span>
                    <span class="detail-field-value"><span class="detail-chip">${escapeHtml(getShortArtifactDetail(d))}</span></span>
                </div>
                <div>
                    <span class="detail-field-label">Validation</span>
                    <span class="detail-field-value"><span class="detail-chip">${escapeHtml((d.validation_state || "discovered").replace(/_/g, " "))}</span></span>
                </div>
                <div>
                    <span class="detail-field-label">Local PDF</span>
                    <span class="detail-field-value">${escapeHtml(localPdfStatus)}</span>
                </div>
                <div>
                    <span class="detail-field-label">Render State</span>
                    <span class="detail-field-value">${escapeHtml((d.render_status || "link_only").replace(/_/g, " "))}</span>
                </div>
                <div>
                    <span class="detail-field-label">Source Tier</span>
                    <span class="detail-field-value">${escapeHtml((d.source_tier || "primary_publisher").replace(/_/g, " "))}</span>
                </div>
                <div>
                    <span class="detail-field-label">First Seen</span>
                    <span class="detail-field-value">${escapeHtml(formatDate(d.first_seen || d.date))}</span>
                </div>
                <div>
                    <span class="detail-field-label">Item Type</span>
                    <span class="detail-field-value"><span class="detail-chip">${escapeHtml(itemType)}</span></span>
                </div>
            </div>
            <div class="detail-actions">
                <a class="row-action-btn primary" href="${escapeHtml(primaryLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(primaryLabel)}</a>
                ${sourcePageUrl ? `<a class="row-action-btn" href="${escapeHtml(sourcePageUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(publisherPageLabel)}</a>` : ""}
            </div>
        </div>
    `;
}

function buildDetailCard(d) {
    if (isShortRecord(d)) return buildShortsDetailCard(d);
    const title = getDisplayTitle(d);
    const target = getDisplayTarget(d);
    const sourceLabel = SOURCE_LABELS[d.source] || d.source || "Unknown";
    const category = TYPE_LABELS[d.announcement_type] || "";
    const contentType = CONTENT_TYPE_LABELS[d.content_type] || "Filing";
    const primaryLabel = d.pdf_filename ? "Open PDF" : "View Source";
    const primaryLink = pdfUrl(d);
    return `
        <div class="detail-card">
            <div class="detail-head">
                <div>
                    <div class="detail-kicker">${escapeHtml(getDisplayActivist(d))} / ${escapeHtml(target)}</div>
                    <div class="detail-title">${escapeHtml(title)}</div>
                </div>
                ${renderSaveButton(d.id, true)}
            </div>
            <div class="detail-grid">
                <div>
                    <span class="detail-field-label">Date</span>
                    <span class="detail-field-value">${escapeHtml(formatDate(d.date))}</span>
                </div>
                <div>
                    <span class="detail-field-label">Source</span>
                    <span class="detail-field-value">${escapeHtml(sourceLabel)}</span>
                </div>
                <div>
                    <span class="detail-field-label">Form Type</span>
                    <span class="detail-field-value">${escapeHtml(d.form_type || "—")}</span>
                </div>
                <div>
                    <span class="detail-field-label">Content Type</span>
                    <span class="detail-field-value"><span class="detail-chip">${escapeHtml(contentType)}</span></span>
                </div>
                <div>
                    <span class="detail-field-label">Category</span>
                    <span class="detail-field-value">${category ? `<span class="detail-chip">${escapeHtml(category)}</span>` : "—"}</span>
                </div>
                <div>
                    <span class="detail-field-label">Sector</span>
                    <span class="detail-field-value">${d.sector ? `<span class="detail-chip">${escapeHtml(d.sector)}</span>` : "—"}</span>
                </div>
            </div>
            <div class="detail-actions">
                <a class="row-action-btn primary" href="${escapeHtml(primaryLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(primaryLabel)}</a>
                ${d.original_url && d.pdf_filename ? `<a class="row-action-btn" href="${escapeHtml(d.original_url)}" target="_blank" rel="noopener noreferrer">Original Source</a>` : ""}
            </div>
        </div>
    `;
}

function buildListHeader() {
    if (activeTab === "shorts") {
        return `
            <div class="list-header list-grid">
                <span>Publisher</span>
                <span>Target</span>
                <span>Artifact</span>
                <span class="col-right">Date</span>
                <span class="col-right">Actions</span>
            </div>
        `;
    }
    return `
        <div class="list-header list-grid">
            <span>Activist</span>
            <span>Situation</span>
            <span>Signal</span>
            <span class="col-right">Date</span>
            <span class="col-right">Save</span>
        </div>
    `;
}

function renderGuide() {
    const container = document.getElementById("list-container");
    updateStats([]);
    container.innerHTML = `
        <div class="guide-page">
            <section class="guide-hero">
                <div class="guide-hero-head">
                    <div>
                        <p class="guide-kicker">System Brief</p>
                        <h2>Campaign and short intelligence pipeline</h2>
                        <p class="guide-copy">This workspace is a multi-source monitoring layer, not a single feed. It merges SEC discovery, exhibit extraction, direct activist publishing, announcement heuristics, and primary short-publisher monitoring into one research surface so you can move from weak signal to primary document without losing provenance.</p>
                    </div>
                    <div class="guide-hero-metrics">
                        <div class="guide-metric">
                            <span class="guide-metric-label">Primary Docs</span>
                            <strong>${allData.filter(d => d.content_type === "pdf_document").length.toLocaleString()}</strong>
                        </div>
                        <div class="guide-metric">
                            <span class="guide-metric-label">Announcements</span>
                            <strong>${allData.filter(d => d.content_type === "announcement").length.toLocaleString()}</strong>
                        </div>
                        <div class="guide-metric">
                            <span class="guide-metric-label">Filings</span>
                            <strong>${allData.filter(d => d.content_type === "filing").length.toLocaleString()}</strong>
                        </div>
                        <div class="guide-metric">
                            <span class="guide-metric-label">Shorts</span>
                            <strong>${allData.filter(d => isShortRecord(d)).length.toLocaleString()}</strong>
                        </div>
                    </div>
                </div>
                <div class="guide-callout-grid">
                    <div class="guide-callout">
                        <span class="guide-callout-label">Primary Use</span>
                        <p>Start in <strong>Presentations</strong> for artifact-first review, pivot to <strong>Filings</strong> for sequence and provenance, and use <strong>Announcements</strong> as the early-warning layer.</p>
                    </div>
                    <div class="guide-callout">
                        <span class="guide-callout-label">Interpretation Rule</span>
                        <p>The closer a row is to the fund or the SEC filing package, the higher the evidentiary value. News rows are directional; PDFs and exhibits are decision-grade.</p>
                    </div>
                </div>
            </section>

            <section class="guide-section">
                <div class="guide-section-head">
                    <h3>Ingestion layers</h3>
                    <p>Each source enters the system for a different reason and carries a different confidence profile.</p>
                </div>
                <div class="guide-grid">
                    <article class="guide-card">
                        <span class="guide-card-tag">Layer 01</span>
                        <h4>SEC EDGAR Discovery</h4>
                        <p>The scraper runs two EDGAR passes: a known-fund/entity-name search and a broader form-type discovery pass, especially for proxy-contest style filings like DFAN14A. That catches both the expected activists and smaller or newly surfaced filers that would be missed by a fund-name-only approach.</p>
                    </article>
                    <article class="guide-card">
                        <span class="guide-card-tag">Layer 02</span>
                        <h4>Filing-Folder Exhibit Extraction</h4>
                        <p>For many SEC filings, the real payload is not the HTML filing page but the exhibit package inside the filing folder. The pipeline crawls filing indexes and pulls linked PDF exhibits so presentations, letters, and investor decks surface as actual documents instead of just parent filing references.</p>
                    </article>
                    <article class="guide-card">
                        <span class="guide-card-tag">Layer 03</span>
                        <h4>Fund Sites & Direct Publishing</h4>
                        <p>Activist websites are scraped separately because many campaigns are framed there before they are easy to interpret through EDGAR alone. These rows are closest to “what did the fund itself put in front of the market?” and usually carry the cleanest presentation titles.</p>
                    </article>
                    <article class="guide-card">
                        <span class="guide-card-tag">Layer 04</span>
                        <h4>Announcement & News Layer</h4>
                        <p>Recent announcements are pulled from broad news discovery and feed-style sources, then normalized with title heuristics into campaign events like stake disclosures, public letters, demands, settlements, and strategic reviews. This layer is best treated as an early-signal monitor, not a substitute for primary docs.</p>
                    </article>
                </div>
            </section>

            <section class="guide-section">
                <div class="guide-section-head">
                    <h3>Signal taxonomy</h3>
                    <p>The signal column is a compressed event classifier. It tells you what kind of campaign pressure the row most likely represents.</p>
                </div>
                <div class="guide-grid">
                    <article class="guide-card">
                        <span class="guide-card-tag">Event</span>
                        <h4>Letter</h4>
                        <p>A direct public communication from the activist. In practice this usually means a framing document aimed at management, the board, or shareholders, and it often marks a campaign turning more public or more confrontational.</p>
                    </article>
                    <article class="guide-card">
                        <span class="guide-card-tag">Event</span>
                        <h4>Stake</h4>
                        <p>A disclosed or reported ownership build. This is the position-formation signal: they entered, sized up, or otherwise became material enough that the market is now paying attention.</p>
                    </article>
                    <article class="guide-card">
                        <span class="guide-card-tag">Event</span>
                        <h4>Demand</h4>
                        <p>A campaign-pressure event. This is the broadest category and usually means the activist is pushing for strategic change, board action, capital allocation changes, or management pressure without the row necessarily being a formal letter.</p>
                    </article>
                    <article class="guide-card">
                        <span class="guide-card-tag">Response</span>
                        <h4>Settlement / Board / Review</h4>
                        <p>These are company-response signals. They tell you the pressure campaign has crossed into negotiation, governance action, or strategic process language on the issuer side.</p>
                    </article>
                </div>
            </section>

            <section class="guide-section">
                <div class="guide-section-head">
                    <h3>Workspace routing</h3>
                    <p>Use the tabs as separate review modes rather than one flat feed.</p>
                </div>
                <div class="guide-grid">
                    <article class="guide-card">
                        <span class="guide-card-tag">Default</span>
                        <h4>Presentations</h4>
                        <p>Use this when you want the actual activist artifact: deck, letter, exhibit PDF, or direct publication. This is the fastest way to answer “what did they actually publish?”</p>
                    </article>
                    <article class="guide-card">
                        <span class="guide-card-tag">Monitor</span>
                        <h4>Announcements</h4>
                        <p>Use this for recency. It is the earliest-warning layer for fresh situations, but you usually want to pivot from here into presentations or filings once a situation looks real.</p>
                    </article>
                    <article class="guide-card">
                        <span class="guide-card-tag">Trace</span>
                        <h4>Filings</h4>
                        <p>Use this for the official paper trail. Campaign view groups related filings into one situation so you can read the sequence of escalation instead of scanning a raw feed of forms.</p>
                    </article>
                    <article class="guide-card">
                        <span class="guide-card-tag">Investigate</span>
                        <h4>Shorts</h4>
                        <p>Use this for primary short-publisher output. <strong>Reports</strong> is the artifact-first surface for native PDFs and rendered investigations; <strong>Signals</strong> keeps teaser posts and link-only findings separate.</p>
                    </article>
                    <article class="guide-card">
                        <span class="guide-card-tag">Working Set</span>
                        <h4>Reading List</h4>
                        <p>Save anything worth handing off or reviewing later, then email yourself a digest or download a ZIP of the underlying documents.</p>
                    </article>
                </div>
            </section>
        </div>
    `;
}

// Infinite scroll state
const BATCH_SIZE = 50;
let lastFiltered = [];
let renderedCount = 0;
let scrollObserver = null;

function buildRowHtml(d) {
    const activistLabel = getDisplayActivist(d);
    const target = getDisplayTarget(d);
    const title = getDisplayTitle(d);
    const marker = getMarkerLabel(d);
    const isExpanded = expandedId === d.id;
    const action = activeTab === "shorts"
        ? `<a class="row-action-btn${d.pdf_filename ? " primary" : ""}" href="${escapeHtml(pdfUrl(d))}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">${d.pdf_filename ? "Open" : "View"}</a>`
        : (activeTab === "presentations" && d.pdf_filename
            ? `<a class="row-action-btn primary" href="${escapeHtml(pdfUrl(d))}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">Open</a>`
            : (activeTab === "all" && d.pdf_filename
                ? `<a class="row-action-btn" href="${escapeHtml(pdfUrl(d))}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">PDF</a>`
                : ""));
    return `
        <div class="list-entry">
            <div class="list-row${isExpanded ? " expanded" : ""}" data-id="${escapeHtml(d.id)}" role="button" tabindex="0" aria-expanded="${isExpanded}" style="--row-color:${activistColor(d.activist)}">
                <span class="row-activist">${escapeHtml(activistLabel)}</span>
                <span class="row-summary row-summary-with-logo">
                    ${renderLogoSlot(d)}
                    <span class="summary-copy">
                        <span class="row-target">${escapeHtml(target)}</span>
                        <span class="row-title">${escapeHtml(title)}</span>
                    </span>
                </span>
                <span class="row-marker">${markerChip(marker)}</span>
                <span class="row-date">${escapeHtml(formatDate(d.date))}</span>
                <span class="row-actions">
                    ${action}
                    ${renderSaveButton(d.id)}
                </span>
            </div>
            ${isExpanded ? `<div class="row-detail">${buildDetailCard(d)}</div>` : ""}
        </div>
    `;
}

function appendNextBatch() {
    const container = document.getElementById("list-container");
    const end = Math.min(renderedCount + BATCH_SIZE, lastFiltered.length);
    if (renderedCount >= end) return;

    const fragment = lastFiltered.slice(renderedCount, end).map(d => buildRowHtml(d)).join("");
    // Remove old sentinel, append rows, add new sentinel
    const oldSentinel = container.querySelector(".scroll-sentinel");
    if (oldSentinel) oldSentinel.remove();

    container.insertAdjacentHTML("beforeend", fragment);
    renderedCount = end;

    if (renderedCount < lastFiltered.length) {
        container.insertAdjacentHTML("beforeend", '<div class="scroll-sentinel"></div>');
        const newSentinel = container.querySelector(".scroll-sentinel");
        if (scrollObserver) scrollObserver.observe(newSentinel);
    }
}

function setupScrollObserver() {
    if (scrollObserver) scrollObserver.disconnect();
    scrollObserver = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && renderedCount < lastFiltered.length) {
            appendNextBatch();
        }
    }, { rootMargin: "400px" });
}

function renderList() {
    performance.mark("render-list-start");
    const filtered = getFiltered();
    const container = document.getElementById("list-container");
    updateStats(filtered);

    if (!filtered.length) {
        container.innerHTML = '<div class="empty-state">No results match your filters.</div>';
        lastFiltered = [];
        renderedCount = 0;
        return;
    }

    lastFiltered = filtered;
    renderedCount = 0;

    // Render header + first batch
    const firstBatch = filtered.slice(0, BATCH_SIZE);
    container.innerHTML = buildListHeader() + firstBatch.map(d => buildRowHtml(d)).join("");
    renderedCount = firstBatch.length;

    // Set up infinite scroll if there are more rows
    if (renderedCount < filtered.length) {
        container.insertAdjacentHTML("beforeend", '<div class="scroll-sentinel"></div>');
        setupScrollObserver();
        const sentinel = container.querySelector(".scroll-sentinel");
        if (sentinel) scrollObserver.observe(sentinel);
    }
    performance.mark("render-list-end");
    performance.measure("render-list", "render-list-start", "render-list-end");
    console.debug(`[perf] render-list: ${performance.getEntriesByName("render-list").pop().duration.toFixed(0)}ms (${filtered.length} total, ${renderedCount} rendered)`);
}

function buildCampaigns(filtered) {
    const campaignMap = {};
    for (const d of filtered) {
        const activistNorm = (d.activist || "").toLowerCase().trim();
        const targetNorm = (d.target_company || "").toLowerCase().trim();
        const key = `${activistNorm}|||${targetNorm}`;
        if (!campaignMap[key]) {
            campaignMap[key] = {
                key,
                activist: d.activist,
                target_company: d.target_company,
                docs: [],
                minDate: d.date || "9999-99-99",
                maxDate: d.date || "",
                sector: d.sector || "",
                latestTitle: getDisplayTitle(d),
                latestDate: d.date || "",
                color: activistColor(d.activist),
            };
        }
        const c = campaignMap[key];
        c.docs.push(d);
        if (d.date && d.date < c.minDate) c.minDate = d.date;
        if (d.date && d.date > c.maxDate) {
            c.maxDate = d.date;
            c.latestTitle = getDisplayTitle(d);
            c.latestDate = d.date;
        }
        if (!c.sector && d.sector) c.sector = d.sector;
    }
    const campaigns = Object.values(campaignMap);
    campaigns.sort((a, b) => (b.maxDate || "").localeCompare(a.maxDate || ""));
    campaigns.forEach(c => {
        c.docs.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    });
    return campaigns;
}

function buildCampaignHeader() {
    return `
        <div class="list-header campaign-grid">
            <span>Activist</span>
            <span>Campaign</span>
            <span class="col-right">Latest</span>
            <span class="col-right">Range</span>
            <span class="col-right">Docs</span>
            <span class="col-right">Open</span>
        </div>
    `;
}

function renderCampaigns() {
    const filtered = getFiltered();
    const campaigns = buildCampaigns(filtered);
    const container = document.getElementById("list-container");
    updateStats(filtered);

    if (!campaigns.length) {
        container.innerHTML = '<div class="empty-state">No campaigns match your filters.</div>';
        return;
    }

    container.innerHTML = buildCampaignHeader() + campaigns.map(c => {
        const isOpen = expandedCampaigns.has(c.key);
        const dateRange = c.minDate === c.maxDate ? formatDate(c.maxDate) : `${formatDate(c.minDate)} → ${formatDate(c.maxDate)}`;
        const docRows = c.docs.map(d => {
            const marker = TYPE_LABELS[d.announcement_type] || SOURCE_LABELS[d.source] || CONTENT_TYPE_LABELS[d.content_type];
            const meta = [d.form_type, d.sector].filter(Boolean).join(" · ");
            return `
                <div class="campaign-doc-row">
                    <div class="campaign-doc-summary row-summary-with-logo">
                        ${renderLogoSlot(d)}
                        <div class="summary-copy">
                            <span class="campaign-doc-title">${escapeHtml(getDisplayTitle(d))}</span>
                            <span class="campaign-doc-meta">${escapeHtml(meta || getDisplayActivist(d))}</span>
                        </div>
                    </div>
                    <span class="row-marker">${markerChip(marker)}</span>
                    <span class="row-date">${escapeHtml(formatDate(d.date))}</span>
                    <span class="row-actions">
                        <a class="row-action-btn${d.pdf_filename ? " primary" : ""}" href="${escapeHtml(pdfUrl(d))}" target="_blank" rel="noopener noreferrer">${d.pdf_filename ? "Open" : "View"}</a>
                        ${renderSaveButton(d.id)}
                    </span>
                </div>
            `;
        }).join("");

        return `
            <div class="campaign-entry">
                <div class="campaign-group-header${isOpen ? " expanded" : ""}" data-campaign-key="${escapeHtml(c.key)}" role="button" tabindex="0" aria-expanded="${isOpen}" style="--row-color:${c.color}">
                    <span class="campaign-activist">${escapeHtml(c.activist || "Unknown")}</span>
                    <span class="campaign-summary row-summary-with-logo">
                        ${renderLogoSlot({ target_company: c.target_company })}
                        <span class="summary-copy">
                            <span class="campaign-target">${escapeHtml(getDisplayTarget({ target_company: c.target_company }))}</span>
                            <span class="campaign-latest">${escapeHtml(c.latestTitle)}</span>
                        </span>
                    </span>
                    <span class="campaign-meta">${escapeHtml(formatDate(c.latestDate))}</span>
                    <span class="campaign-range">${escapeHtml(dateRange)}</span>
                    <span class="campaign-count">${c.docs.length} docs</span>
                    <span class="campaign-actions">
                        <span class="campaign-toggle" aria-hidden="true">${isOpen ? "−" : "+"}</span>
                    </span>
                </div>
                ${isOpen ? `<div class="campaign-group-docs"><div class="campaign-docs-shell">${docRows}</div></div>` : ""}
            </div>
        `;
    }).join("");
}

function render() {
    writeUrlState();
    const controls = document.querySelector(".control-panel");
    const stats = document.getElementById("stats-bar");
    syncToolbarState();
    if (activeTab === "guide") {
        controls.style.display = "none";
        stats.style.display = "none";
        renderGuide();
    } else {
        controls.style.display = "";
        stats.style.display = "";
        if (activeTab === "shorts") renderList();
        else if (viewMode === "campaigns") renderCampaigns();
        else renderList();
    }
    syncSaveButtons();
}

function syncSaveButtons() {
    document.querySelectorAll(".row-save-btn, .detail-save-btn").forEach(btn => {
        const saved = ReadingList.has(btn.dataset.id);
        btn.classList.toggle("saved", saved);
        btn.setAttribute("title", saved ? "Remove from reading list" : "Add to reading list");
        btn.setAttribute("aria-label", saved ? "Remove from reading list" : "Add to reading list");
        const withLabel = btn.classList.contains("detail-save-btn");
        btn.innerHTML = bookmarkSvg(saved) + (withLabel ? `<span class="detail-save-label">${saved ? "Saved" : "Save"}</span>` : "");
    });
}

document.getElementById("list-container").addEventListener("click", e => {
    const saveBtn = e.target.closest(".row-save-btn, .detail-save-btn");
    if (saveBtn) {
        e.preventDefault();
        e.stopPropagation();
        ReadingList.toggle(saveBtn.dataset.id);
        return;
    }

    if (e.target.closest("a")) return;

    const row = e.target.closest(".list-row");
    if (row) {
        const id = row.dataset.id;
        expandedId = expandedId === id ? null : id;
        renderList();
        return;
    }

    const campaignHeader = e.target.closest(".campaign-group-header");
    if (campaignHeader) {
        const key = campaignHeader.dataset.campaignKey;
        if (expandedCampaigns.has(key)) expandedCampaigns.delete(key);
        else expandedCampaigns.add(key);
        renderCampaigns();
    }
});

document.addEventListener("click", e => {
    const insideEntry = e.target.closest(".list-entry, .campaign-entry");
    const insideControls = e.target.closest(".control-panel");
    const insideSidebar = e.target.closest(".reading-list-sidebar, #reading-list-toggle");
    if (!insideEntry && !insideControls && !insideSidebar) {
        let changed = false;
        if (expandedId !== null) {
            expandedId = null;
            changed = true;
        }
        if (expandedCampaigns.size) {
            expandedCampaigns.clear();
            changed = true;
        }
        const filterPanel = document.getElementById("filter-panel");
        if (!filterPanel.classList.contains("collapsed")) {
            toggleFilterPanel(false);
        }
        if (changed) render();
    }
});

document.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
    const rows = document.querySelectorAll(".list-row, .campaign-group-header");

    if (e.key === "ArrowDown" || e.key === "j") {
        if (!rows.length) return;
        e.preventDefault();
        focusedIndex = Math.min(focusedIndex + 1, rows.length - 1);
        rows[focusedIndex].focus();
    } else if (e.key === "ArrowUp" || e.key === "k") {
        if (!rows.length) return;
        e.preventDefault();
        focusedIndex = Math.max(focusedIndex - 1, 0);
        rows[focusedIndex].focus();
    } else if (e.key === "Enter") {
        if (focusedIndex >= 0 && focusedIndex < rows.length) rows[focusedIndex].click();
    } else if (e.key === "Escape") {
        const sidebar = document.getElementById("reading-list-sidebar");
        if (sidebar.classList.contains("open")) {
            closeReadingListSidebar();
            return;
        }
        expandedId = null;
        expandedCampaigns.clear();
        render();
    } else if (e.key === "r") {
        const sidebar = document.getElementById("reading-list-sidebar");
        if (sidebar.classList.contains("open")) closeReadingListSidebar();
        else openReadingListSidebar();
    } else if (e.key === "b") {
        if (focusedIndex >= 0 && focusedIndex < rows.length) {
            const btn = rows[focusedIndex].querySelector(".row-save-btn");
            if (btn) btn.click();
        }
    }
});

document.getElementById("list-container").addEventListener("keydown", e => {
    const row = e.target.closest(".list-row, .campaign-group-header");
    if (!row) return;
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        row.click();
    }
});

document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => setActiveTab(btn.dataset.tab));
});

document.getElementById("shorts-reports").addEventListener("click", () => setActiveShortsTab("reports"));
document.getElementById("shorts-signals").addEventListener("click", () => setActiveShortsTab("signals"));

document.querySelectorAll(".signal-tier-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        activeSignalTier = btn.dataset.tier;
        syncSignalTierButtons();
        expandedId = null;
        expandedCampaigns.clear();
        render();
    });
});
document.getElementById("view-list").addEventListener("click", () => setViewMode("list", true));
document.getElementById("view-campaigns").addEventListener("click", () => setViewMode("campaigns", true));
document.getElementById("toggle-filters").addEventListener("click", () => toggleFilterPanel());

document.getElementById("activist-filter").addEventListener("change", render);
document.getElementById("source-filter").addEventListener("change", render);
document.getElementById("type-filter").addEventListener("change", render);
document.getElementById("sector-filter").addEventListener("change", render);
document.getElementById("search-input").addEventListener("input", () => {
    // Clear server-side results when user edits — fall back to client-side substring
    if (semanticResultIds) { semanticResultIds = null; }
    if (ftsResultIds) { ftsResultIds = null; }
    if (!semanticMode) render();  // semantic mode waits for Enter
});
document.getElementById("search-input").addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    const q = document.getElementById("search-input").value.trim();
    if (semanticMode) {
        runSemanticSearch(q);
    } else {
        runFtsSearch(q);
    }
});
document.getElementById("sort-select").addEventListener("change", render);

document.getElementById("semantic-toggle").addEventListener("click", () => {
    semanticMode = !semanticMode;
    semanticResultIds = null;
    semanticQuery = "";
    ftsResultIds = null;
    updateSemanticUI();
    render();
});

document.getElementById("reading-list-toggle").addEventListener("click", () => {
    const sidebar = document.getElementById("reading-list-sidebar");
    if (sidebar.classList.contains("open")) closeReadingListSidebar();
    else openReadingListSidebar();
});
document.getElementById("rl-close").addEventListener("click", closeReadingListSidebar);
document.getElementById("rl-overlay").addEventListener("click", closeReadingListSidebar);

document.getElementById("rl-body").addEventListener("click", e => {
    const removeBtn = e.target.closest(".rl-item-remove");
    if (!removeBtn) return;
    ReadingList.remove(removeBtn.dataset.id);
    ReadingList.refresh();
});

document.getElementById("rl-clear-btn").addEventListener("click", () => {
    if (confirm("Remove all items from your reading list?")) {
        ReadingList.clear();
        ReadingList.refresh();
    }
});

document.getElementById("rl-email-btn").addEventListener("click", () => {
    const form = document.getElementById("rl-email-form");
    form.style.display = form.style.display === "none" ? "flex" : "none";
});

document.getElementById("rl-email-send").addEventListener("click", () => {
    const email = document.getElementById("rl-email-input").value.trim();
    if (!email || !email.includes("@")) {
        alert("Please enter a valid email address.");
        return;
    }

    const items = ReadingList.getItems();
    if (!items.length) {
        alert("Your reading list is empty.");
        return;
    }

    const subject = `Activist Aggregator Reading List (${items.length} items)`;
    const bodyLines = items.map((d, i) => {
        const url = d.pdf_filename
            ? new URL(pdfAssetPath(d), window.location.href).href
            : (d.original_url || "");
        return `${i + 1}. ${getDisplayActivist(d)} / ${getDisplayTarget(d)}\n${getDisplayTitle(d)}\n${formatDate(d.date)}\n${url}`;
    });
    const body = `Reading list digest\n\n${bodyLines.join("\n\n")}`;
    const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (mailtoUrl.length > 1900) {
        const proceed = confirm("This reading list is large and may be truncated by some mail clients. Continue?");
        if (!proceed) return;
    }
    window.location.href = mailtoUrl;
});

document.getElementById("rl-download-btn").addEventListener("click", async () => {
    const items = ReadingList.getItems();
    if (!items.length) {
        alert("Your reading list is empty.");
        return;
    }

    const btn = document.getElementById("rl-download-btn");
    const originalText = btn.textContent;
    btn.textContent = "Preparing...";
    btn.disabled = true;

    try {
        const zip = new JSZip();
        const manifestLines = ["Activist Aggregator Reading List", "=".repeat(34), ""];
        let fetched = 0;

        for (const d of items) {
            fetched++;
            btn.textContent = `Downloading ${fetched}/${items.length}...`;
            const label = `${getDisplayActivist(d)} / ${getDisplayTarget(d)} | ${getDisplayTitle(d)} | ${formatDate(d.date)}`;

            if (!DEPLOY_MODE && d.pdf_filename) {
                // Local mode: fetch from local PDF cache
                try {
                    const resp = await fetch(pdfAssetPath(d));
                    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                    const blob = await resp.blob();
                    zip.file(d.pdf_filename, blob);
                    manifestLines.push(`${label}\nFile: ${d.pdf_filename}\nStatus: downloaded\nSource: ${d.original_url || "local only"}\n`);
                } catch (err) {
                    manifestLines.push(`${label}\nFile: ${d.pdf_filename}\nStatus: failed (${err.message})\nSource: ${d.original_url || "unknown"}\n`);
                }
            } else if (d.original_url) {
                // Deploy mode or no local PDF: fetch via proxy
                try {
                    const proxyUrl = `/api/fetch-pdf?url=${encodeURIComponent(d.original_url)}`;
                    const resp = await fetch(proxyUrl);
                    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                    const contentType = resp.headers.get("content-type") || "";
                    const blob = await resp.blob();
                    const isPdf = contentType.includes("pdf");
                    const safeName = (d.title || d.id || "document").replace(/[^a-zA-Z0-9_\- ]/g, "").substring(0, 80);
                    const ext = isPdf ? ".pdf" : ".html";
                    const filename = `${safeName}${ext}`;
                    zip.file(filename, blob);
                    manifestLines.push(`${label}\nFile: ${filename}\nStatus: downloaded (${isPdf ? "PDF" : "HTML"})\nSource: ${d.original_url}\n`);
                } catch (err) {
                    manifestLines.push(`${label}\nLink: ${d.original_url}\nStatus: failed (${err.message})\n`);
                }
            } else {
                manifestLines.push(`${label}\nStatus: no URL available\n`);
            }
        }

        zip.file("reading-list-manifest.txt", manifestLines.join("\n"));
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = `activist-reading-list-${new Date().toISOString().slice(0, 10)}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    } catch (err) {
        alert("Failed to create ZIP: " + err.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
});

toggleFilterPanel(false);
loadData();
