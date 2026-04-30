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

const TRACKER_EVENT_LABELS = {
    stake_disclosure: "Stake Disclosure",
    activist_letter: "Activist Letter",
    activist_deck: "Activist Deck",
    proxy_filing: "Proxy Filing",
    board_nomination: "Board Nomination",
    company_response: "Company Response",
    settlement: "Settlement",
    strategic_review_response: "Strategic Review",
    vote_result: "Vote Result",
    activist_press_release: "Press Release",
    campaign_demand: "Campaign Demand",
    campaign_update: "Campaign Update",
};

const TRACKER_STATUS_LABELS = {
    active: "Active",
    resolved: "Resolved",
    dormant: "Dormant",
    provisional: "Provisional",
};

const TRACKER_EVIDENCE_LABELS = {
    primary_filing: "Primary Filing",
    primary_fund: "Primary Fund",
    company_release: "Company Release",
    wire: "Wire",
    news: "News",
};

const EVENT_TAG_LABELS = {
    stake_disclosure: "Stake",
    activist_letter: "Letter",
    activist_deck: "Deck",
    proxy_filing: "Proxy",
    board_nomination: "Board",
    company_response: "Response",
    settlement: "Settlement",
    strategic_review: "Review",
    vote_result: "Vote",
};

const STRATEGY_TAG_LABELS = {
    board_change: "Board Change",
    sale_process: "Sale Process",
    breakup: "Breakup",
    capital_return: "Capital Return",
    governance: "Governance",
    operating_turnaround: "Turnaround",
    valuation_gap: "Valuation Gap",
    balance_sheet: "Balance Sheet",
    asset_monetization: "Asset Monetization",
    take_private_or_merger: "Take-Private / Merger",
};

const QUALITY_TAG_LABELS = {
    primary_filing: "Primary Filing",
    primary_fund: "Primary Fund",
    company_release: "Company Release",
    wire: "Wire",
    news: "News",
    provisional: "Provisional",
    confirmed: "Confirmed",
    high_signal: "High Signal",
    medium_signal: "Medium Signal",
};

const FILER_ROLE_LABELS = {
    "activist-firm": "Activist Firms",
    "individual-activist": "Individual Activists",
    "issuer-company": "Issuer / Company",
    "deal-party": "Deal Party / Acquirer",
    "institutional-other": "Institutional / Other",
};

const KNOWN_ACTIVIST_FIRM_PATTERNS = [
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
];

const NON_ACTIVIST_FILER_PATTERNS = [
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
];

const ACTIVIST_STYLE_KEYWORDS = [
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
];

const ISSUER_LIKE_KEYWORDS = [
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
];

const PRIVATE_VEHICLE_FORMS = [
    "llc",
    "lp",
    "ltd",
    "limited",
    "sa",
];

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

// SEC EDGAR returns individual filer names as "LASTNAME FIRSTNAME MIDDLENAME".
// We can't safely auto-flip — names like "Third Point" or "HM Treasury" lack
// firm suffixes and would mis-detect as people. So override explicit cases.
// Add new entries as you spot them. Long-term fix belongs in the scraper.
const ACTIVIST_NAME_OVERRIDES = {
    "Su Eric Horn": "Eric Horn Su",
    "Radoff Bradley Louis": "Bradley Louis Radoff",
    "STILWELL JOSEPH": "Joseph Stilwell",
    "BAKER JULIAN": "Julian Baker",
    "Musk Elon": "Elon Musk",
    "DILLER BARRY": "Barry Diller",
    "DOUGLAS KEVIN": "Kevin Douglas",
    "HARRIS JOSHUA": "Joshua Harris",
    "ROBOTTI ROBERT": "Robert Robotti",
    "DEASON DARWIN": "Darwin Deason",
    "SINGER KAREN": "Karen Singer",
    "Dolby Dagmar": "Dagmar Dolby",
    "EBRAHIMI FARHAD FRED": "Farhad Fred Ebrahimi",
    "Smith Denver Johnson": "Denver Johnson Smith",
    "Karkus Ted William": "Ted William Karkus",
    "Herzfeld Erik Mervin": "Erik Mervin Herzfeld",
    "Waite Carol Farmer": "Carol Farmer Waite",
    "WILLIAMS RANDA DUNCAN": "Randa Duncan Williams",
    "HELU CARLOS SLIM": "Carlos Slim Helu",
    "Hsieh Anthony Li": "Anthony Li Hsieh",
    "STAD MARC": "Marc Stad",
    "RAZIN SHELDON": "Sheldon Razin",
    "Cooperstone Elliot": "Elliot Cooperstone",
    "Rosenbaum Paul": "Paul Rosenbaum",
    "Seaberg Karen": "Karen Seaberg",
    "Milikowsky Nathan": "Nathan Milikowsky",
    "Economou George": "George Economou",
    "Otto Alexander": "Alexander Otto",
    "Zyuzin Igor": "Igor Zyuzin",
    "Kahli Beat": "Beat Kahli",
    "Barta Jan": "Jan Barta",
};

const TAB_DEFAULT_VIEW = {
    guide: "guide",
    all: "list",
    presentations: "list",
    announcements: "campaigns",
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
let trackerData = { campaigns: [], counts: {} };
let trackerLoaded = false;
let trackerLoadPromise = null;
let trackerDetailPromises = new Map();
let trackerLoadingCampaigns = new Set();
let activeTab = "presentations";
let activeShortsTab = "reports";
let activeSignalTier = TAB_DEFAULT_SIGNAL[activeTab];
let viewMode = TAB_DEFAULT_VIEW[activeTab];
let expandedId = null;
let expandedCampaigns = new Set();
const TRACKER_ROW_HEIGHT = 79;
const TRACKER_HYDRATE_MARGIN = "800px 0px";
let trackerObserver = null;
let trackerCampaignsById = new Map();
let focusedIndex = -1;
let urlPinnedView = false;
let tickerCompanyMap = new Map();
let accessionTargetMap = new Map();
let pendingUrlFilterState = null;

// Search mode state
let semanticMode = false;
let semanticResultIds = null;   // ordered array of IDs from last API call, or null
let semanticQuery = "";
let semanticLoading = false;
let ftsResultIds = null;        // ordered array of IDs from FTS search, or null

// Deploy mode state
let DEPLOY_MODE = false;
let deployMeta = null;

// Perf debug logs: opt-in via ?debug=1 in URL or localStorage["activist-debug"]=1.
// Was unconditional console.debug on every render — quiet in normal use, easy to
// toggle on when diagnosing slowness.
const DEBUG_MODE = (() => {
    try {
        const params = new URLSearchParams(location.search);
        if (params.has("debug")) return true;
        return localStorage.getItem("activist-debug") === "1";
    } catch {
        return false;
    }
})();

// Filter dropdown indexes — computed once after allData is loaded.
// allData/trackerData are immutable post-load, so dropdown contents are too.
// Without this cache, each tab switch did 9 × full-data passes + 13k DOM appends
// for the activist dropdown alone (3074ms freeze). Memoized: <5ms.
let filterIndexCache = null;

// Logo manifest: { "Apple Inc": "apple-inc-3a4f.png", ... }
// Pre-fetched at build time by scripts/prefetch_logos.py. Lets us serve the
// top ~1000 brand logos as same-origin static assets instead of hitting
// logo.dev's CDN per row. Long-tail names still fall back to logo.dev.
let logoManifest = null;

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
            const linkLabel = hasPdfAccess(d) ? "PDF" : "Link";
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
    if (filterIndexCache) return filterIndexCache.activistRecords;
    return allData.filter(d => !isShortRecord(d));
}

function rebuildFilterIndexes() {
    const t0 = performance.now();
    const activistRecords = allData.filter(d => !isShortRecord(d));
    const shortsRecords = allData.filter(d => isShortRecord(d));
    const filingRecords = activistRecords.filter(d => d.content_type === "filing");
    const campaigns = trackerData.campaigns || [];

    function tally(items, getter) {
        const counts = Object.create(null);
        for (const item of items) {
            const value = getter(item);
            if (Array.isArray(value)) {
                for (const v of value) if (v) counts[v] = (counts[v] || 0) + 1;
            } else if (value) {
                counts[value] = (counts[value] || 0) + 1;
            }
        }
        return counts;
    }

    function uniqueSorted(items, getter) {
        return [...new Set(items.map(getter).filter(Boolean))].sort();
    }

    // Pre-compute filer roles for each filing record (the per-row regex work
    // is what made updateFilerRoleFilter cost 858ms on every tab switch).
    const filerRoleCounts = Object.create(null);
    for (const d of filingRecords) {
        const role = getFilerRole(d);
        filerRoleCounts[role] = (filerRoleCounts[role] || 0) + 1;
    }

    // Header stat counts: derived from allData (immutable post-load), so cache
    // once instead of recomputing on every updateStats() call (was iterating
    // 63k records 3 times per render on filter/tab/search changes).
    const totalActivistCount = new Set(activistRecords.map(d => d.activist).filter(Boolean)).size;
    const totalShortPublisherCount = new Set(shortsRecords.map(getShortPublisher).filter(Boolean)).size;

    filterIndexCache = {
        activistRecords,
        shortsRecords,
        filingRecords,
        campaigns,
        totalActivistCount,
        totalShortPublisherCount,
        // Activist dropdown — 12.9k entries on prod, two variants
        activistsAnnouncements: uniqueSorted(campaigns, c => c.canonical_activist),
        activistsDocs: uniqueSorted(
            activistRecords.filter(d => d.source !== "google_news"),
            d => d.activist
        ),
        // Sectors
        sectorsAnnouncements: tally(campaigns, c => (c.sector_tags || [])[0] || "unknown"),
        sectorsDocs: tally(activistRecords, d => (d.sector_tags || [])[0] || "unknown"),
        // Type counts (filings tab)
        formTypesFilings: tally(activistRecords, d => d.form_type || "Unknown"),
        // Tracker-only filters
        trackerEventTypeCounts: tally(campaigns, c => c.material_event_types || []),
        trackerStatusCounts: tally(campaigns, c => c.campaign_status || "provisional"),
        trackerEventTagCounts: tally(campaigns, c => c.event_tags || []),
        trackerStrategyTagCounts: tally(campaigns, c => c.strategy_tags || []),
        trackerQualityTagCounts: tally(campaigns, c => c.quality_tags || []),
        trackerSourceCounts: tally(campaigns, c => c.source_names || []),
        // Filings-tab tag counts
        filingEventTagCounts: tally(filingRecords, d => d.event_tags || []),
        filingStrategyTagCounts: tally(filingRecords, d => d.strategy_tags || []),
        filingQualityTagCounts: tally(filingRecords, d => d.quality_tags || []),
        filerRoleCounts,
    };
    if (DEBUG_MODE) console.debug(`[perf] rebuildFilterIndexes: ${(performance.now() - t0).toFixed(0)}ms`);
}

// Build an <option> element. Using DOM API auto-escapes text; safer than innerHTML.
function makeOption(value, label) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = label;
    return opt;
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
    if (Object.prototype.hasOwnProperty.call(ACTIVIST_NAME_OVERRIDES, activist)) {
        return ACTIVIST_NAME_OVERRIDES[activist];
    }
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
    // Source data sometimes has unmatched parens like "REPUBLIC FIRST BANCORP INC (FRBK"
    cleaned = cleaned.replace(/\s*\([A-Z0-9 ,&.\-]{1,30}$/g, "").trim();
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

// Some short / ambiguous company names collide with unrelated firms in
// logo.dev's name index ("Snap" returned Snap-on Tools instead of Snap Inc).
// When we know the ticker, use logo.dev's /ticker/ endpoint which is
// unambiguous. Add new mappings here when a wrong logo shows up on the
// tracker for a known company.
const LOGO_TICKER_OVERRIDES = {
    "snap": "SNAP",
    "snap inc": "SNAP",
    "snap, inc.": "SNAP",
    "snapchat": "SNAP",
    "americold": "COLD",
    "americold realty": "COLD",
    "americold realty trust": "COLD",
    "umg": "UMGP",
    "lamb weston": "LW",
    "carmax": "KMX",
    "norwegian cruise line": "NCLH",
    "tegna": "TGNA",
    "synopsys": "SNPS",
};

function logoDevUrl(name) {
    const key = (name || "").trim().toLowerCase();
    const ticker = LOGO_TICKER_OVERRIDES[key];
    if (ticker) {
        return `https://img.logo.dev/ticker/${encodeURIComponent(ticker)}?token=${encodeURIComponent(LOGO_DEV_PUBLIC_KEY)}&size=40&retina=true&format=png&theme=auto&fallback=404`;
    }
    return `https://img.logo.dev/name/${encodeURIComponent(name)}?token=${encodeURIComponent(LOGO_DEV_PUBLIC_KEY)}&size=40&retina=true&format=png&theme=auto&fallback=404`;
}

function renderLogoSlot(d) {
    if (!isHighConfidenceLogoTarget(d)) {
        return '<span class="target-logo-slot is-empty" aria-hidden="true"></span>';
    }
    const names = getLogoLookupCandidates(d);
    const candidates = [];
    // Prefer same-origin static logos (no external request per row, no logo.dev cookies/tracking).
    if (logoManifest) {
        for (const name of names) {
            const filename = logoManifest[name];
            if (filename) {
                candidates.push(`assets/logos/${encodeURIComponent(filename)}`);
                break;
            }
        }
    }
    // Logo.dev fallbacks cover long-tail names not in the prefetch manifest.
    for (const name of names) candidates.push(logoDevUrl(name));
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
    if (DEPLOY_MODE && d.blob_url) return d.blob_url;
    if (!DEPLOY_MODE && d.pdf_filename) return pdfAssetPath(d);
    return d.original_url || d.blob_url || "#";
}

function hasPdfAccess(d) {
    return Boolean(d.pdf_filename || d.blob_url);
}

function buildAssetPath(suffix) {
    const path = window.location.pathname || "/";
    const inWebsiteDir = path.includes("/website/");
    const atWebsiteRoot = !inWebsiteDir;
    if (inWebsiteDir) return `/data/${suffix}`;
    if (atWebsiteRoot) return `../data/${suffix}`;
    return `../data/${suffix}`;
}

function normalizeFilerText(value) {
    return (value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function tokenizeEntityName(value) {
    return normalizeFilerText(value)
        .split(" ")
        .filter(token => token && ![
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
        ].includes(token));
}

function looksLikeIndividualActivistName(name) {
    if (!/^[a-z]+ [a-z]+(?: [a-z])?$/.test(name)) return false;
    const businessWords = new Set([...ACTIVIST_STYLE_KEYWORDS, ...ISSUER_LIKE_KEYWORDS, ...PRIVATE_VEHICLE_FORMS]);
    return !name.split(" ").some(token => businessWords.has(token));
}

function namesLikelySameEntity(left, right) {
    const leftTokens = tokenizeEntityName(left);
    const rightTokens = tokenizeEntityName(right);
    if (!leftTokens.length || !rightTokens.length) return false;
    const leftJoined = leftTokens.join(" ");
    const rightJoined = rightTokens.join(" ");
    if (leftJoined === rightJoined) return true;
    const overlap = leftTokens.filter(token => rightTokens.includes(token));
    const minLen = Math.min(leftTokens.length, rightTokens.length);
    return overlap.length >= Math.min(2, minLen) && overlap.length / minLen >= 0.67;
}

function isActivistFirmRecord(d) {
    if (d.filer_role) return d.filer_role === "activist-firm" || d.filer_role === "individual-activist";
    const name = normalizeFilerText(d.activist || "");
    if (!name) return false;
    if (d.source === "sec_edgar") return true;
    if (KNOWN_ACTIVIST_FIRM_PATTERNS.some(pattern => name.includes(pattern))) return true;
    if (NON_ACTIVIST_FILER_PATTERNS.some(pattern => name.includes(pattern))) return false;
    const keywordHits = ACTIVIST_STYLE_KEYWORDS.filter(keyword => new RegExp(`\\b${keyword}\\b`).test(name)).length;
    const looksIssuerLike = ISSUER_LIKE_KEYWORDS.some(keyword => new RegExp(`\\b${keyword}\\b`).test(name));
    const hasFundLegalForm = /\b(lp|llc|ltd|limited)\b/.test(name);
    const hasPrivateVehicleForm = PRIVATE_VEHICLE_FORMS.some(keyword => new RegExp(`\\b${keyword}\\b`).test(name));
    const looksLikePerson = looksLikeIndividualActivistName(name);
    return !looksIssuerLike && (keywordHits >= 2 || (keywordHits >= 1 && hasFundLegalForm) || hasPrivateVehicleForm || looksLikePerson);
}

function matchesKnownActivistFirm(name) {
    return KNOWN_ACTIVIST_FIRM_PATTERNS.some(pattern => name.includes(pattern));
}

function getFilerRole(d) {
    if (d.filer_role) return d.filer_role;
    const name = normalizeFilerText(d.activist || "");
    const target = normalizeFilerText(d.target_company || "");
    if (!name) return "institutional-other";
    if (isActivistFirmRecord(d)) {
        const looksFirmLike = d.source === "sec_edgar"
            || matchesKnownActivistFirm(name)
            || ACTIVIST_STYLE_KEYWORDS.some(keyword => new RegExp(`\\b${keyword}\\b`).test(name))
            || PRIVATE_VEHICLE_FORMS.some(keyword => new RegExp(`\\b${keyword}\\b`).test(name));
        return looksLikeIndividualActivistName(name) && !looksFirmLike ? "individual-activist" : "activist-firm";
    }
    if (namesLikelySameEntity(name, target)) return "issuer-company";
    if (NON_ACTIVIST_FILER_PATTERNS.some(pattern => name.includes(pattern))) return "institutional-other";
    if (ISSUER_LIKE_KEYWORDS.some(keyword => new RegExp(`\\b${keyword}\\b`).test(name)) || PRIVATE_VEHICLE_FORMS.some(keyword => new RegExp(`\\b${keyword}\\b`).test(name))) {
        return "deal-party";
    }
    return looksLikeIndividualActivistName(name) ? "individual-activist" : "institutional-other";
}

function getRecencyCutoff(option) {
    if (!option) return null;
    const now = new Date();
    const cutoff = new Date(now);
    if (option === "7d") cutoff.setDate(cutoff.getDate() - 7);
    else if (option === "30d") cutoff.setDate(cutoff.getDate() - 30);
    else if (option === "90d") cutoff.setDate(cutoff.getDate() - 90);
    else if (option === "ytd") return new Date(now.getFullYear(), 0, 1);
    else return null;
    return cutoff;
}

function passesRecency(dateStr, option) {
    const cutoff = getRecencyCutoff(option);
    if (!cutoff) return true;
    if (!dateStr) return false;
    const parsed = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return false;
    return parsed >= cutoff;
}

function getSelectedValues(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return [];
    return Array.from(select.selectedOptions).map(option => option.value).filter(Boolean);
}

function setSelectedValues(selectId, values) {
    const select = document.getElementById(selectId);
    if (!select) return;
    const wanted = new Set(values || []);
    Array.from(select.options).forEach(option => {
        option.selected = wanted.has(option.value);
    });
}

function setSelectValueIfAvailable(selectId, value) {
    const select = document.getElementById(selectId);
    if (!select || !value) return;
    const hasOption = Array.from(select.options).some(option => option.value === value);
    if (hasOption) select.value = value;
}

function applyPendingUrlFilterState() {
    if (!pendingUrlFilterState) return;
    setSelectValueIfAvailable("activist-filter", pendingUrlFilterState.activist);
    setSelectValueIfAvailable("source-filter", pendingUrlFilterState.source);
    setSelectValueIfAvailable("type-filter", pendingUrlFilterState.type);
    setSelectValueIfAvailable("sector-filter", pendingUrlFilterState.sector);
    setSelectValueIfAvailable("filing-scope-filter", pendingUrlFilterState.filingScope);
    setSelectValueIfAvailable("filer-role-filter", pendingUrlFilterState.filerRole);
    setSelectValueIfAvailable("campaign-status-filter", pendingUrlFilterState.campaignStatus);
    setSelectValueIfAvailable("event-tag-filter", pendingUrlFilterState.eventTag);
    setSelectValueIfAvailable("quality-tag-filter", pendingUrlFilterState.qualityTag);
    setSelectedValues("strategy-tag-filter", pendingUrlFilterState.strategyTags);
}

function hasRequiredTags(recordTags, requiredTags) {
    if (!requiredTags.length) return true;
    const tagSet = new Set(recordTags || []);
    return requiredTags.every(tag => tagSet.has(tag));
}

function titleCaseLabel(value) {
    return (value || "")
        .split(/[_\s]+/)
        .filter(Boolean)
        .map(token => token.charAt(0).toUpperCase() + token.slice(1))
        .join(" ");
}

function eventTagLabel(tag) {
    return EVENT_TAG_LABELS[tag] || titleCaseLabel(tag);
}

function strategyTagLabel(tag) {
    return STRATEGY_TAG_LABELS[tag] || titleCaseLabel(tag);
}

function qualityTagLabel(tag) {
    return QUALITY_TAG_LABELS[tag] || titleCaseLabel(tag);
}

function sectorTagLabel(tag) {
    return tag === "unknown" ? "Unknown" : titleCaseLabel(tag);
}

function renderChipSet(tags, labelFn, className = "summary-chip") {
    if (!tags || !tags.length) return "";
    return `<span class="summary-tags">${tags.map(tag => `<span class="${className}">${escapeHtml(labelFn(tag))}</span>`).join("")}</span>`;
}

function getTrackerCampaignById(campaignId) {
    return (trackerData.campaigns || []).find(campaign => campaign.campaign_id === campaignId) || null;
}

function trackerCampaignHasDetails(campaign) {
    return !!campaign && Array.isArray(campaign.events);
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

async function ensureTrackerData(background = false) {
    if (trackerLoaded) return trackerData;
    if (!trackerLoadPromise) {
        trackerLoadPromise = (async () => {
            const fetchedTrackerData = await fetchJsonFile("campaign_tracker_index.json");
            trackerData = fetchedTrackerData || { campaigns: [], counts: {} };
            trackerLoaded = true;
            trackerLoadPromise = null;
            // Refresh the filter index cache now that tracker campaigns are known.
            rebuildFilterIndexes();
            updateTabCounts();
            if (activeTab === "announcements") {
                updateActivistFilter();
                updateSectorFilter();
                updateTypeFilter();
                updateSourceFilter();
                updateCampaignStatusFilter();
                updateEventTagFilter();
                updateStrategyTagFilter();
                updateQualityTagFilter();
                applyPendingUrlFilterState();
                pendingUrlFilterState = null;
                render();
            }
            return trackerData;
        })().catch(err => {
            trackerLoadPromise = null;
            throw err;
        });
    }
    if (background) {
        trackerLoadPromise.catch(() => {});
        return trackerLoadPromise;
    }
    return trackerLoadPromise;
}

async function ensureTrackerCampaignDetails(campaignId, background = false) {
    const campaign = getTrackerCampaignById(campaignId);
    if (!campaign) return null;
    if (trackerCampaignHasDetails(campaign)) return campaign;
    if (!campaign.detail_path) return campaign;

    if (!trackerDetailPromises.has(campaignId)) {
        trackerLoadingCampaigns.add(campaignId);
        const detailPromise = fetchJsonFile(campaign.detail_path)
            .then(detail => {
                if (detail) Object.assign(campaign, detail);
                trackerLoadingCampaigns.delete(campaignId);
                trackerDetailPromises.delete(campaignId);
                return campaign;
            })
            .catch(error => {
                campaign.detail_error = true;
                trackerLoadingCampaigns.delete(campaignId);
                trackerDetailPromises.delete(campaignId);
                throw error;
            });
        trackerDetailPromises.set(campaignId, detailPromise);
    }

    if (background) {
        trackerDetailPromises.get(campaignId).catch(() => {});
        return trackerDetailPromises.get(campaignId);
    }
    return trackerDetailPromises.get(campaignId);
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
    if (activeTab === "presentations") {
        return SOURCE_LABELS[d.source] || CONTENT_TYPE_LABELS[d.content_type] || "Presentation";
    }
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

    // Kick off the logo manifest fetch alongside the data fetches. It's a small
    // file (~57KB) and renderLogoSlot tolerates it being null until ready.
    const logoManifestPromise = fetch("assets/logos/manifest.json")
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null)
        .then(json => { if (json) logoManifest = json; });

    try {
        const activistData = await fetchJsonFile("data.json");
        const shortsData = await fetchJsonFile("shorts/shorts.json");
        await logoManifestPromise; // Settle before first render so initial logos use static paths.
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
        if (DEBUG_MODE) console.debug(`[perf] data-load: ${performance.getEntriesByName("data-load")[0].duration.toFixed(0)}ms`);
        rebuildFilterIndexes();
        populateFilters();
        ensureTrackerData(true);  // fire-and-forget; refreshes tab count + UI when ready
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
    updateActivistFilter();
    updateSectorFilter();
    updateTypeFilter();
    updateSourceFilter();
    updateFilerRoleFilter();
    updateCampaignStatusFilter();
    updateEventTagFilter();
    updateStrategyTagFilter();
    updateQualityTagFilter();
    performance.mark("filters-end");
    performance.measure("populate-filters", "filters-start", "filters-end");
    if (DEBUG_MODE) console.debug(`[perf] populate-filters: ${performance.getEntriesByName("populate-filters").pop().duration.toFixed(0)}ms`);
}

function updateActivistFilter() {
    const activistSelect = document.getElementById("activist-filter");
    const currentVal = activistSelect.value;

    // Read from cache (rebuilt only on data load). Build a detached fragment
    // so options land in the DOM with one mutation, not 13k.
    const activists = filterIndexCache
        ? (activeTab === "announcements"
            ? filterIndexCache.activistsAnnouncements
            : filterIndexCache.activistsDocs)
        : [];

    const fragment = document.createDocumentFragment();
    fragment.appendChild(makeOption("", "All Activists"));
    for (const a of activists) fragment.appendChild(makeOption(a, a));
    activistSelect.replaceChildren(fragment);

    if (currentVal) {
        activistSelect.value = currentVal;
        if (activistSelect.value !== currentVal) activistSelect.value = "";
    }
}

function updateSectorFilter() {
    const sectorSelect = document.getElementById("sector-filter");
    const currentVal = sectorSelect.value;
    while (sectorSelect.options.length > 1) sectorSelect.remove(1);

    const sectors = {};
    if (activeTab === "announcements") {
        (trackerData.campaigns || []).forEach(c => {
            const sector = (c.sector_tags || [])[0] || "unknown";
            sectors[sector] = (sectors[sector] || 0) + 1;
        });
    } else {
        getActivistRecords().forEach(d => {
            const sector = (d.sector_tags || [])[0] || "unknown";
            sectors[sector] = (sectors[sector] || 0) + 1;
        });
    }

    Object.keys(sectors).sort().forEach(s => {
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = `${sectorTagLabel(s)} (${sectors[s]})`;
        sectorSelect.appendChild(opt);
    });
    if (currentVal) {
        sectorSelect.value = currentVal;
        if (sectorSelect.value !== currentVal) sectorSelect.value = "";
    }
}

function updateTypeFilter() {
    const typeSelect = document.getElementById("type-filter");
    const currentVal = typeSelect.value;
    typeSelect.options[0].textContent = activeTab === "filings" ? "All Filing Types" : "All Types";
    while (typeSelect.options.length > 1) typeSelect.remove(1);

    if (activeTab === "announcements") {
        const trackerTypeCounts = {};
        (trackerData.campaigns || []).forEach(c => {
            (c.material_event_types || []).forEach(eventType => {
                trackerTypeCounts[eventType] = (trackerTypeCounts[eventType] || 0) + 1;
            });
        });
        Object.keys(trackerTypeCounts).sort().forEach(type => {
            const opt = document.createElement("option");
            opt.value = type;
            opt.textContent = `${TRACKER_EVENT_LABELS[type] || type} (${trackerTypeCounts[type]})`;
            typeSelect.appendChild(opt);
        });
    } else if (activeTab === "filings") {
        const formTypeCounts = {};
        getActivistRecords().forEach(d => {
            const formType = d.form_type || "Unknown";
            formTypeCounts[formType] = (formTypeCounts[formType] || 0) + 1;
        });
        Object.keys(formTypeCounts).sort().forEach(formType => {
            const opt = document.createElement("option");
            opt.value = formType;
            opt.textContent = `${formType} (${formTypeCounts[formType]})`;
            typeSelect.appendChild(opt);
        });
    } else {
        Object.entries(TYPE_LABELS).forEach(([value, label]) => {
            const opt = document.createElement("option");
            opt.value = value;
            opt.textContent = label;
            typeSelect.appendChild(opt);
        });
    }

    if (currentVal) {
        typeSelect.value = currentVal;
        if (typeSelect.value !== currentVal) typeSelect.value = "";
    }
}

function updateFilerRoleFilter() {
    const roleSelect = document.getElementById("filer-role-filter");
    const currentVal = roleSelect.value;

    const fragment = document.createDocumentFragment();
    fragment.appendChild(makeOption("", "All Filer Roles"));
    if (activeTab === "filings" && filterIndexCache) {
        const roleCounts = filterIndexCache.filerRoleCounts;
        for (const role of Object.keys(FILER_ROLE_LABELS)) {
            const count = roleCounts[role];
            if (!count) continue;
            fragment.appendChild(makeOption(role, `${FILER_ROLE_LABELS[role]} (${count})`));
        }
    }
    roleSelect.replaceChildren(fragment);

    if (currentVal) {
        roleSelect.value = currentVal;
        if (roleSelect.value !== currentVal) roleSelect.value = "";
    }
}

function updateCampaignStatusFilter() {
    const statusSelect = document.getElementById("campaign-status-filter");
    const currentVal = statusSelect.value;
    while (statusSelect.options.length > 1) statusSelect.remove(1);
    if (activeTab === "announcements") {
        const statusCounts = {};
        (trackerData.campaigns || []).forEach(campaign => {
            const status = campaign.campaign_status || "provisional";
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        Object.keys(TRACKER_STATUS_LABELS).forEach(status => {
            if (!statusCounts[status]) return;
            const opt = document.createElement("option");
            opt.value = status;
            opt.textContent = `${TRACKER_STATUS_LABELS[status] || status} (${statusCounts[status]})`;
            statusSelect.appendChild(opt);
        });
    }
    if (currentVal) {
        statusSelect.value = currentVal;
        if (statusSelect.value !== currentVal) statusSelect.value = "";
    }
}

function updateEventTagFilter() {
    const eventSelect = document.getElementById("event-tag-filter");
    const currentVal = eventSelect.value;
    while (eventSelect.options.length > 1) eventSelect.remove(1);
    if (activeTab === "announcements") {
        const counts = {};
        (trackerData.campaigns || []).forEach(campaign => {
            (campaign.event_tags || []).forEach(tag => {
                counts[tag] = (counts[tag] || 0) + 1;
            });
        });
        Object.keys(counts).sort().forEach(tag => {
            const opt = document.createElement("option");
            opt.value = tag;
            opt.textContent = `${eventTagLabel(tag)} (${counts[tag]})`;
            eventSelect.appendChild(opt);
        });
    } else if (activeTab === "filings") {
        const counts = {};
        getActivistRecords()
            .filter(d => d.content_type === "filing")
            .forEach(d => {
                (d.event_tags || []).forEach(tag => {
                    counts[tag] = (counts[tag] || 0) + 1;
                });
            });
        Object.keys(counts).sort().forEach(tag => {
            const opt = document.createElement("option");
            opt.value = tag;
            opt.textContent = `${eventTagLabel(tag)} (${counts[tag]})`;
            eventSelect.appendChild(opt);
        });
    }
    if (currentVal) {
        eventSelect.value = currentVal;
        if (eventSelect.value !== currentVal) eventSelect.value = "";
    }
}

function updateStrategyTagFilter() {
    const strategySelect = document.getElementById("strategy-tag-filter");
    const currentVals = getSelectedValues("strategy-tag-filter");
    while (strategySelect.options.length) strategySelect.remove(0);
    if (activeTab === "announcements") {
        const counts = {};
        (trackerData.campaigns || []).forEach(campaign => {
            (campaign.strategy_tags || []).forEach(tag => {
                counts[tag] = (counts[tag] || 0) + 1;
            });
        });
        Object.keys(counts).sort().forEach(tag => {
            const opt = document.createElement("option");
            opt.value = tag;
            opt.textContent = `${strategyTagLabel(tag)} (${counts[tag]})`;
            strategySelect.appendChild(opt);
        });
    } else if (activeTab === "filings") {
        const counts = {};
        getActivistRecords()
            .filter(d => d.content_type === "filing")
            .forEach(d => {
                (d.strategy_tags || []).forEach(tag => {
                    counts[tag] = (counts[tag] || 0) + 1;
                });
            });
        Object.keys(counts).sort().forEach(tag => {
            const opt = document.createElement("option");
            opt.value = tag;
            opt.textContent = `${strategyTagLabel(tag)} (${counts[tag]})`;
            strategySelect.appendChild(opt);
        });
    }
    setSelectedValues("strategy-tag-filter", currentVals);
}

function updateQualityTagFilter() {
    const qualitySelect = document.getElementById("quality-tag-filter");
    const currentVal = qualitySelect.value;
    while (qualitySelect.options.length > 1) qualitySelect.remove(1);
    if (activeTab === "announcements") {
        const counts = {};
        (trackerData.campaigns || []).forEach(campaign => {
            (campaign.quality_tags || []).forEach(tag => {
                counts[tag] = (counts[tag] || 0) + 1;
            });
        });
        Object.keys(counts).sort().forEach(tag => {
            const opt = document.createElement("option");
            opt.value = tag;
            opt.textContent = `${qualityTagLabel(tag)} (${counts[tag]})`;
            qualitySelect.appendChild(opt);
        });
    } else if (activeTab === "filings") {
        const counts = {};
        getActivistRecords()
            .filter(d => d.content_type === "filing")
            .forEach(d => {
                (d.quality_tags || []).forEach(tag => {
                    counts[tag] = (counts[tag] || 0) + 1;
                });
            });
        Object.keys(counts).sort().forEach(tag => {
            const opt = document.createElement("option");
            opt.value = tag;
            opt.textContent = `${qualityTagLabel(tag)} (${counts[tag]})`;
            qualitySelect.appendChild(opt);
        });
    }
    if (currentVal) {
        qualitySelect.value = currentVal;
        if (qualitySelect.value !== currentVal) qualitySelect.value = "";
    }
}

function updateSourceFilter() {
    if (activeTab === "guide") return;
    const sourceSelect = document.getElementById("source-filter");
    const currentVal = sourceSelect.value;
    while (sourceSelect.options.length > 1) sourceSelect.remove(1);

    const relevantSources = TAB_SOURCES[activeTab] || [];
    const contentType = TAB_CONTENT_TYPES[activeTab];
    const sourceCounts = {};

    if (activeTab === "announcements") {
        (trackerData.campaigns || []).forEach(campaign => {
            (campaign.source_names || []).forEach(source => {
                sourceCounts[source] = (sourceCounts[source] || 0) + 1;
            });
        });
    } else {
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
    }

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
    document.getElementById("tab-count-announcements").textContent = trackerLoaded
        ? (trackerData.campaigns || []).length.toLocaleString()
        : counts.announcements.toLocaleString();
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
    const searchInput = document.getElementById("search-input");
    const sortByParty = document.getElementById("sort-by-party");
    const filingScope = document.getElementById("filing-scope-filter");
    const filerRole = document.getElementById("filer-role-filter");
    const campaignStatus = document.getElementById("campaign-status-filter");
    const eventTag = document.getElementById("event-tag-filter");
    const strategyTag = document.getElementById("strategy-tag-filter");
    const qualityTag = document.getElementById("quality-tag-filter");
    const typeFilter = document.getElementById("type-filter");
    const recency = document.getElementById("recency-filter");
    const semanticToggle = document.getElementById("semantic-toggle");

    const signalTabs = document.getElementById("signal-tier-tabs");
    const shortsMode = activeTab === "shorts";
    const trackerMode = activeTab === "announcements";
    shortsTabs.style.display = shortsMode ? "inline-flex" : "none";
    viewGroup.style.display = shortsMode || trackerMode ? "none" : "inline-flex";
    filtersButton.style.display = shortsMode ? "none" : "inline-flex";
    filingScope.style.display = activeTab === "filings" ? "" : "none";
    filerRole.style.display = activeTab === "filings" ? "" : "none";
    campaignStatus.style.display = trackerMode ? "" : "none";
    eventTag.style.display = activeTab === "filings" || trackerMode ? "" : "none";
    strategyTag.style.display = activeTab === "filings" || trackerMode ? "" : "none";
    qualityTag.style.display = activeTab === "filings" || trackerMode ? "" : "none";
    typeFilter.style.display = trackerMode ? "none" : "";
    recency.style.display = activeTab === "guide" ? "none" : "";
    if (semanticToggle) semanticToggle.style.display = trackerMode ? "none" : "";
    sortByParty.textContent = shortsMode ? "By Publisher" : "By Activist";
    if (semanticMode) {
        searchInput.placeholder = shortsMode
            ? "e.g. short squeeze thesis on pharma — Enter to search"
            : (trackerMode ? "e.g. company response to activist campaign — Enter to search" : "e.g. board seat fight at a retailer — Enter to search");
    } else {
        searchInput.placeholder = shortsMode
            ? "Hindenburg, Viceroy, ticker, target..."
            : (trackerMode ? "Search activist, target, latest event, or coverage..." : "Elliott, proxy fight, DFAN14A, Starbucks...");
    }
    if (shortsMode) toggleFilterPanel(false);
    if (activeTab === "guide") {
        shortsTabs.style.display = "none";
        viewGroup.style.display = "none";
        filtersButton.style.display = "none";
    }
    if (signalTabs) {
        const showSignal = SIGNAL_TIER_TABS.has(activeTab) && !trackerMode;
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

    pendingUrlFilterState = {
        activist: params.get("activist") || "",
        source: params.get("source") || "",
        type: params.get("type") || "",
        sector: params.get("sector") || "",
        filingScope: params.get("filing_scope") || "",
        filerRole: params.get("filer_role") || "",
        campaignStatus: params.get("campaign_status") || "",
        eventTag: params.get("event_tag") || "",
        strategyTags: (params.get("strategy_tags") || "").split(",").filter(Boolean),
        qualityTag: params.get("quality_tag") || "",
    };

    if (params.get("recency")) document.getElementById("recency-filter").value = params.get("recency");
    if (params.get("q")) document.getElementById("search-input").value = params.get("q");
    if (params.get("sort")) document.getElementById("sort-select").value = params.get("sort");

    urlPinnedView = params.has("view");
    const requestedView = params.get("view");
    if (activeTab === "shorts" || activeTab === "guide") {
        urlPinnedView = false;
        viewMode = TAB_DEFAULT_VIEW[activeTab];
    } else if (activeTab === "announcements") {
        urlPinnedView = false;
        viewMode = "campaigns";
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
    updateActivistFilter();
    updateSectorFilter();
    updateTypeFilter();
    updateSourceFilter();
    updateFilerRoleFilter();
    updateCampaignStatusFilter();
    updateEventTagFilter();
    updateStrategyTagFilter();
    updateQualityTagFilter();
    applyPendingUrlFilterState();
    if (activeTab !== "announcements" || trackerLoaded) {
        pendingUrlFilterState = null;
    }
    syncToolbarState();
}

function writeUrlState() {
    const params = new URLSearchParams();
    const activist = document.getElementById("activist-filter").value;
    const source = document.getElementById("source-filter").value;
    const type = document.getElementById("type-filter").value;
    const sector = document.getElementById("sector-filter").value;
    const filingScope = document.getElementById("filing-scope-filter").value;
    const filerRole = document.getElementById("filer-role-filter").value;
    const campaignStatus = document.getElementById("campaign-status-filter").value;
    const eventTag = document.getElementById("event-tag-filter").value;
    const strategyTags = getSelectedValues("strategy-tag-filter");
    const qualityTag = document.getElementById("quality-tag-filter").value;
    const recency = document.getElementById("recency-filter").value;
    const search = document.getElementById("search-input").value.trim();
    const sort = document.getElementById("sort-select").value;

    if (activeTab !== "presentations") params.set("tab", activeTab);
    if (activeTab === "shorts" && activeShortsTab !== "reports") params.set("shorts", activeShortsTab);
    if (activeTab !== "shorts" && activeTab !== "guide") {
        if (activist) params.set("activist", activist);
        if (source) params.set("source", source);
        if (type) params.set("type", type);
        if (sector) params.set("sector", sector);
        if (activeTab === "filings" && filingScope !== "all") params.set("filing_scope", filingScope);
        if (activeTab === "filings" && filerRole) params.set("filer_role", filerRole);
        if (activeTab === "announcements" && campaignStatus) params.set("campaign_status", campaignStatus);
        if ((activeTab === "filings" || activeTab === "announcements") && eventTag) params.set("event_tag", eventTag);
        if ((activeTab === "filings" || activeTab === "announcements") && strategyTags.length) params.set("strategy_tags", strategyTags.join(","));
        if ((activeTab === "filings" || activeTab === "announcements") && qualityTag) params.set("quality_tag", qualityTag);
    }
    if (activeTab !== "guide" && recency) params.set("recency", recency);
    if (search) params.set("q", search);
    if (sort !== "date-desc") params.set("sort", sort);
    if (activeTab !== "shorts" && activeTab !== "guide" && activeTab !== "announcements" && viewMode !== TAB_DEFAULT_VIEW[activeTab]) {
        params.set("view", viewMode);
    }
    if (SIGNAL_TIER_TABS.has(activeTab) && activeSignalTier !== TAB_DEFAULT_SIGNAL[activeTab]) {
        params.set("signal", activeSignalTier);
    }

    const qs = params.toString();
    history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
}

function setViewMode(mode, persistPinnedView = false) {
    if (activeTab === "guide" || activeTab === "shorts" || activeTab === "announcements") return;
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
    updateActivistFilter();
    updateSectorFilter();
    updateTypeFilter();
    updateSourceFilter();
    updateFilerRoleFilter();
    updateCampaignStatusFilter();
    updateEventTagFilter();
    updateStrategyTagFilter();
    updateQualityTagFilter();
    if (tab === "shorts") {
        urlPinnedView = false;
        activeShortsTab = "reports";
        viewMode = TAB_DEFAULT_VIEW[tab];
        setShortsViewButtons(activeShortsTab);
        setViewButtons(viewMode);
    } else if (tab === "announcements") {
        urlPinnedView = false;
        viewMode = "campaigns";
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
    const filingScope = document.getElementById("filing-scope-filter").value;
    const filerRole = document.getElementById("filer-role-filter").value;
    const eventTag = document.getElementById("event-tag-filter").value;
    const strategyTags = getSelectedValues("strategy-tag-filter");
    const qualityTag = document.getElementById("quality-tag-filter").value;
    const recency = document.getElementById("recency-filter").value;
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
            if (type) {
                if (activeTab === "filings") {
                    if ((d.form_type || "Unknown") !== type) return false;
                } else if (d.announcement_type !== type) {
                    return false;
                }
            }
            if (activeTab === "filings" && filingScope === "activist-firms" && !isActivistFirmRecord(d)) return false;
            if (activeTab === "filings" && filerRole && getFilerRole(d) !== filerRole) return false;
            if ((activeTab === "filings" || activeTab === "announcements") && eventTag && !(d.event_tags || []).includes(eventTag)) return false;
            if ((activeTab === "filings" || activeTab === "announcements") && !hasRequiredTags(d.strategy_tags || [], strategyTags)) return false;
            if ((activeTab === "filings" || activeTab === "announcements") && qualityTag && !(d.quality_tags || []).includes(qualityTag)) return false;
            if (sector) {
                const docSector = (d.sector_tags || [])[0] || "unknown";
                if (docSector !== sector) return false;
            }
        }
        if (!passesRecency(d.date, recency)) return false;
        if (SIGNAL_TIER_TABS.has(activeTab) && activeSignalTier !== "all") {
            if ((d.signal_tier || "low") !== activeSignalTier) return false;
            if (activeTab === "filings" && activeSignalTier === "high" && !isActivistFirmRecord(d)) return false;
        }
        // Server-side search results (semantic or FTS) — only show matched records
        if (semanticRankMap) return semanticRankMap.has(d.id);
        if (ftsRankMap) return ftsRankMap.has(d.id);
        if (search) {
            const haystack = `${d.activist} ${d.publisher || ""} ${d.target_company} ${d.target_ticker || ""} ${d.title} ${d.form_type} ${d.announcement_type || ""} ${d.render_status || ""} ${(d.event_tags || []).join(" ")} ${(d.strategy_tags || []).join(" ")} ${(d.quality_tags || []).join(" ")}`.toLowerCase();
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

function flattenCampaignArtifacts(campaign) {
    if (!trackerCampaignHasDetails(campaign)) return [];
    return [
        ...(campaign.coverage_artifacts || []),
        ...(campaign.low_trust_artifacts || []),
        ...((campaign.events || []).flatMap(event => [
            ...(event.artifacts || []),
            ...(event.coverage_artifacts || []),
        ])),
    ];
}

function getFilteredTrackerCampaigns() {
    const activist = document.getElementById("activist-filter").value;
    const source = document.getElementById("source-filter").value;
    const type = document.getElementById("type-filter").value;
    const sector = document.getElementById("sector-filter").value;
    const campaignStatus = document.getElementById("campaign-status-filter").value;
    const eventTag = document.getElementById("event-tag-filter").value;
    const strategyTags = getSelectedValues("strategy-tag-filter");
    const qualityTag = document.getElementById("quality-tag-filter").value;
    const recency = document.getElementById("recency-filter").value;
    const search = document.getElementById("search-input").value.toLowerCase();
    const sort = document.getElementById("sort-select").value;

    const filtered = (trackerData.campaigns || []).filter(campaign => {
        if (activist && campaign.canonical_activist !== activist) return false;
        if (campaignStatus && campaign.campaign_status !== campaignStatus) return false;
        if (!passesRecency(campaign.last_updated_at, recency)) return false;
        if (eventTag && !(campaign.event_tags || []).includes(eventTag)) return false;
        if (!hasRequiredTags(campaign.strategy_tags || [], strategyTags)) return false;
        if (qualityTag && !(campaign.quality_tags || []).includes(qualityTag)) return false;
        if (sector) {
            const campaignSector = (campaign.sector_tags || [])[0] || "unknown";
            if (campaignSector !== sector) return false;
        }
        if (type && !(campaign.material_event_types || []).includes(type)) return false;
        if (source) {
            if (!(campaign.source_names || []).includes(source)) return false;
        }
        if (search) {
            const haystack = [
                campaign.canonical_activist,
                campaign.canonical_target,
                campaign.latest_material_event_type,
                campaign.campaign_status,
                ...(campaign.event_tags || []),
                ...(campaign.strategy_tags || []),
                ...(campaign.quality_tags || []),
                campaign.search_text || "",
            ].join(" ").toLowerCase();
            if (!haystack.includes(search)) return false;
        }
        return true;
    });

    filtered.sort((left, right) => {
        if (sort === "date-asc") return (left.last_updated_at || "").localeCompare(right.last_updated_at || "");
        if (sort === "activist") return (left.canonical_activist || "").localeCompare(right.canonical_activist || "");
        return (right.last_updated_at || "").localeCompare(left.last_updated_at || "");
    });

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
        const activistCount = filterIndexCache ? filterIndexCache.totalActivistCount : 0;
        document.getElementById("header-stats").textContent = `${fmtNum(allData.length)} records · ${fmtNum(activistCount)} activists`;
        return;
    }
    if (activeTab === "announcements") {
        const campaigns = filtered;
        const activists = new Set(campaigns.map(c => c.canonical_activist).filter(Boolean)).size;
        const targets = new Set(campaigns.map(c => c.canonical_target).filter(Boolean)).size;
        const primaryArtifacts = campaigns.reduce((sum, c) => sum + (c.primary_artifact_count || 0), 0);
        const coverage = campaigns.reduce((sum, c) => sum + (c.coverage_count || 0), 0);
        const provisional = campaigns.filter(c => c.provisional).length;

        document.getElementById("stats-bar").innerHTML = [
            `<span class="stat-item"><strong>${fmtNum(campaigns.length)}</strong> campaigns</span>`,
            `<span class="stat-item"><strong>${fmtNum(activists)}</strong> activists</span>`,
            `<span class="stat-item"><strong>${fmtNum(targets)}</strong> targets</span>`,
            `<span class="stat-item"><strong>${fmtNum(primaryArtifacts)}</strong> primary artifacts</span>`,
            `<span class="stat-item"><strong>${fmtNum(coverage)}</strong> related articles</span>`,
            `<span class="stat-item"><strong>${fmtNum(provisional)}</strong> provisional</span>`,
        ].join("");

        document.getElementById("header-stats").textContent =
            `${fmtNum(trackerData.counts.campaigns || campaigns.length)} campaigns · ${fmtNum(trackerData.counts.confirmed || 0)} confirmed`;
        return;
    }
    const uniqueActivists = new Set(filtered.map(d => activeTab === "shorts" ? getShortPublisher(d) : d.activist).filter(Boolean)).size;
    const uniqueTargets = new Set(filtered.map(d => d.target_company).filter(Boolean)).size;
    const pdfCount = filtered.filter(d => d.pdf_filename).length;
    const bar = document.getElementById("stats-bar");
    const statLabel = activeTab === "shorts" ? "publishers" : "activists";
    const extraShortsStats = activeTab === "shorts"
        ? [
            `<span class="stat-item"><strong>${fmtNum(filtered.filter(d => d.validation_state === "validated").length)}</strong> validated</span>`,
            `<span class="stat-item"><strong>${fmtNum(filtered.filter(d => d.render_status === "rendered_pdf").length)}</strong> rendered PDFs</span>`,
        ]
        : [];
    const statItems = [
        `<span class="stat-item"><strong>${fmtNum(filtered.length)}</strong> results</span>`,
        `<span class="stat-item"><strong>${fmtNum(uniqueActivists)}</strong> ${statLabel}</span>`,
        `<span class="stat-item"><strong>${fmtNum(uniqueTargets)}</strong> targets</span>`,
    ];
    if (!DEPLOY_MODE && pdfCount > 0) {
        statItems.push(`<span class="stat-item"><strong>${fmtNum(pdfCount)}</strong> local PDFs</span>`);
    }
    statItems.push(...extraShortsStats);
    bar.innerHTML = statItems.join("");

    // Read cached totals from rebuildFilterIndexes — these are over allData and
    // never change. Was 2x Set() of 63k records on every render.
    const activistCount = filterIndexCache ? filterIndexCache.totalActivistCount : 0;
    const shortPublisherCount = filterIndexCache ? filterIndexCache.totalShortPublisherCount : 0;
    const headerStats = document.getElementById("header-stats");
    headerStats.textContent = activeTab === "shorts"
        ? `${fmtNum(allData.length)} records · ${fmtNum(shortPublisherCount)} short publishers`
        : `${fmtNum(allData.length)} records · ${fmtNum(activistCount)} activists`;
}

// Consistent number formatting across stats bars and header.
// Without this, the page mixed "63519 RECORDS" with "62,809" tab counts.
function fmtNum(n) {
    return Number(n || 0).toLocaleString("en-US");
}

// Build a richer empty state with a "Clear filters" action.
// Reads current filter state to hint at what's filtered out.
function buildEmptyStateHtml(headline) {
    const search = (document.getElementById("search-input") || {}).value || "";
    const activist = (document.getElementById("activist-filter") || {}).value || "";
    const source = (document.getElementById("source-filter") || {}).value || "";
    const sector = (document.getElementById("sector-filter") || {}).value || "";
    const recency = (document.getElementById("recency-filter") || {}).value || "";

    const activeFilters = [];
    if (search) activeFilters.push(`search "${escapeHtml(search)}"`);
    if (activist) activeFilters.push(`activist "${escapeHtml(activist)}"`);
    if (source) activeFilters.push(`source "${escapeHtml(source)}"`);
    if (sector) activeFilters.push(`sector "${escapeHtml(sector)}"`);
    if (recency) activeFilters.push(`recency ${escapeHtml(recency)}`);

    const filterHint = activeFilters.length
        ? `<p class="empty-state-hint">Active filters: ${activeFilters.join(" · ")}</p>`
        : `<p class="empty-state-hint">Try a different tab, or remove filters to broaden the search.</p>`;

    const showClearBtn = activeFilters.length > 0;
    return `
        <div class="empty-state">
            <p class="empty-state-headline">${escapeHtml(headline || "No results match your filters.")}</p>
            ${filterHint}
            ${showClearBtn ? `<button id="empty-state-clear" type="button" class="empty-state-btn">Clear filters</button>` : ""}
        </div>
    `;
}

function clearAllFilters() {
    const inputs = [
        "search-input", "activist-filter", "source-filter", "type-filter",
        "sector-filter", "filing-scope-filter", "filer-role-filter",
        "campaign-status-filter", "event-tag-filter", "quality-tag-filter",
        "recency-filter",
    ];
    for (const id of inputs) {
        const el = document.getElementById(id);
        if (el) el.value = "";
    }
    const strategySel = document.getElementById("strategy-tag-filter");
    if (strategySel) Array.from(strategySel.options).forEach(o => { o.selected = false; });
    if (typeof semanticResultIds !== "undefined") semanticResultIds = null;
    if (typeof ftsResultIds !== "undefined") ftsResultIds = null;
    semanticQuery = "";
    render();
}

// Delegate handler for the Clear-filters button inside empty states.
document.addEventListener("click", e => {
    if (e.target && e.target.id === "empty-state-clear") clearAllFilters();
});

function bookmarkSvg(filled) {
    return `<svg width="14" height="14" viewBox="0 0 16 16" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.5"><path d="M3 2h10a1 1 0 011 1v11l-6-3-6 3V3a1 1 0 011-1z"/></svg>`;
}

function markerChip(label) {
    if (!label) return "";
    return `<span class="marker-chip">${escapeHtml(label)}</span>`;
}

function filingSummaryChips(d) {
    if (activeTab !== "filings") return "";
    const tags = [];
    const filerRole = getFilerRole(d);
    if (filerRole) tags.push(`<span class="summary-chip summary-chip-role">${escapeHtml(FILER_ROLE_LABELS[filerRole] || filerRole)}</span>`);
    if (d.event_tags && d.event_tags[0]) tags.push(`<span class="summary-chip">${escapeHtml(eventTagLabel(d.event_tags[0]))}</span>`);
    if (d.strategy_tags && d.strategy_tags[0]) tags.push(`<span class="summary-chip">${escapeHtml(strategyTagLabel(d.strategy_tags[0]))}</span>`);
    if (d.signal_tier) tags.push(`<span class="summary-chip summary-chip-quality">${escapeHtml(qualityTagLabel(`${d.signal_tier}_signal`))}</span>`);
    return tags.length ? `<span class="summary-tags">${tags.join("")}</span>` : "";
}

function trackerSummaryChips(campaign) {
    const tags = [];
    if (campaign.latest_event_tag) tags.push(`<span class="summary-chip">${escapeHtml(eventTagLabel(campaign.latest_event_tag))}</span>`);
    if (campaign.latest_strategy_tags && campaign.latest_strategy_tags[0]) tags.push(`<span class="summary-chip">${escapeHtml(strategyTagLabel(campaign.latest_strategy_tags[0]))}</span>`);
    if (campaign.sector_tags && campaign.sector_tags[0]) tags.push(`<span class="summary-chip summary-chip-sector">${escapeHtml(sectorTagLabel(campaign.sector_tags[0]))}</span>`);
    if (campaign.quality_tags && campaign.quality_tags[0]) tags.push(`<span class="summary-chip summary-chip-quality">${escapeHtml(qualityTagLabel(campaign.quality_tags[0]))}</span>`);
    return tags.length ? `<span class="summary-tags">${tags.join("")}</span>` : "";
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
    const primaryLabel = hasPdfAccess(d) ? "Open PDF" : "View Source";
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
    const primaryLabel = hasPdfAccess(d) ? "Open PDF" : "View Source";
    const primaryLink = pdfUrl(d);
    const eventTags = renderChipSet(d.event_tags || [], eventTagLabel, "detail-chip");
    const strategyTags = renderChipSet(d.strategy_tags || [], strategyTagLabel, "detail-chip");
    const sectorTags = renderChipSet(d.sector_tags || [], sectorTagLabel, "detail-chip");
    const qualityTags = renderChipSet(d.quality_tags || [], qualityTagLabel, "detail-chip");
    const filerRole = activeTab === "filings" ? `<span class="detail-chip">${escapeHtml(FILER_ROLE_LABELS[getFilerRole(d)] || getFilerRole(d))}</span>` : "—";
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
                    <span class="detail-field-value">${sectorTags || "—"}</span>
                </div>
                <div>
                    <span class="detail-field-label">Event Tags</span>
                    <span class="detail-field-value">${eventTags || "—"}</span>
                </div>
                <div>
                    <span class="detail-field-label">Strategy Tags</span>
                    <span class="detail-field-value">${strategyTags || "—"}</span>
                </div>
                <div>
                    <span class="detail-field-label">Quality</span>
                    <span class="detail-field-value">${qualityTags || "—"}</span>
                </div>
                <div>
                    <span class="detail-field-label">Filer Role</span>
                    <span class="detail-field-value">${filerRole}</span>
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
        ? `<a class="row-action-btn${hasPdfAccess(d) ? " primary" : ""}" href="${escapeHtml(pdfUrl(d))}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">${hasPdfAccess(d) ? "Open" : "View"}</a>`
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
                        ${filingSummaryChips(d)}
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
        container.innerHTML = buildEmptyStateHtml("No results match your filters.");
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
    if (DEBUG_MODE) console.debug(`[perf] render-list: ${performance.getEntriesByName("render-list").pop().duration.toFixed(0)}ms (${filtered.length} total, ${renderedCount} rendered)`);
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
        container.innerHTML = buildEmptyStateHtml("No campaigns match your filters.");
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
                        <a class="row-action-btn${hasPdfAccess(d) ? " primary" : ""}" href="${escapeHtml(pdfUrl(d))}" target="_blank" rel="noopener noreferrer">${hasPdfAccess(d) ? "Open" : "View"}</a>
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
                    <span class="campaign-count">${c.docs.length} ${c.docs.length === 1 ? "doc" : "docs"}</span>
                    <span class="campaign-actions">
                        <span class="campaign-toggle" aria-hidden="true">${isOpen ? "−" : "+"}</span>
                    </span>
                </div>
                ${isOpen ? `<div class="campaign-group-docs"><div class="campaign-docs-shell">${docRows}</div></div>` : ""}
            </div>
        `;
    }).join("");
}

function trackerArtifactUrl(artifact) {
    if (DEPLOY_MODE && artifact.blob_url) {
        return artifact.blob_url;
    }
    if (!DEPLOY_MODE && artifact.pdf_filename) {
        return buildAssetPath(`pdfs/${encodeURIComponent(artifact.pdf_filename)}`);
    }
    return artifact.source_url || artifact.blob_url || "#";
}

function trackerArtifactReadingListId(campaign, artifact) {
    if (artifact.raw_id) return artifact.raw_id;
    return stableId({
        original_url: artifact.source_url,
        pdf_filename: artifact.pdf_filename,
        activist: campaign.canonical_activist,
        target_company: campaign.canonical_target,
        date: artifact.published_at,
        title: artifact.headline || artifact.title || "",
    });
}

function trackerEvidenceChip(rank, extraClass = "") {
    const label = TRACKER_EVIDENCE_LABELS[rank] || rank || "Source";
    return `<span class="detail-chip${extraClass ? ` ${extraClass}` : ""}">${escapeHtml(label)}</span>`;
}

function trackerStatusChip(status) {
    const label = TRACKER_STATUS_LABELS[status] || status || "Unknown";
    const statusClass = status ? ` tracker-status-${status}` : "";
    return `<span class="detail-chip tracker-status-chip${statusClass}">${escapeHtml(label)}</span>`;
}

function trackerAttachmentChip(confidence) {
    if (typeof confidence !== "number") return "";
    return `<span class="detail-chip tracker-confidence-chip">${Math.round(confidence * 100)}% confidence</span>`;
}

function findCampaignEvent(campaign, eventId) {
    return (campaign.events || []).find(event => event.event_id === eventId) || null;
}

function getCampaignRowArtifact(campaign) {
    if (campaign.row_artifact) return campaign.row_artifact;
    const latestEvent = findCampaignEvent(campaign, campaign.latest_material_event_id);
    const candidateArtifacts = [
        ...((latestEvent && latestEvent.artifacts) || []),
        ...((latestEvent && latestEvent.coverage_artifacts) || []),
        ...(campaign.coverage_artifacts || []),
        ...(campaign.low_trust_artifacts || []),
        ...((campaign.events || []).flatMap(event => event.artifacts || [])),
    ];
    return candidateArtifacts.find(Boolean) || null;
}

function buildTrackerArtifactRow(campaign, artifact, options = {}) {
    const {
        bucketLabel = "",
        secondary = false,
        lowTrust = false,
    } = options;
    const sourceLabel = trackerEvidenceChip(artifact.evidence_rank, "tracker-artifact-chip");
    const confidenceChip = trackerAttachmentChip(artifact.attachment_confidence);
    const relatedCount = artifact.related_count || 0;
    const relatedChip = relatedCount ? `<span class="detail-chip tracker-related-chip">+${relatedCount} related</span>` : "";
    const readingListId = trackerArtifactReadingListId(campaign, artifact);
    const saveButton = readingListId ? renderSaveButton(readingListId) : "";
    const openLabel = (DEPLOY_MODE && artifact.blob_url) || (!DEPLOY_MODE && artifact.pdf_filename) ? "Open PDF" : "Open";
    const artifactMeta = [
        SOURCE_LABELS[artifact.source_name] || artifact.source_name || "Unknown source",
        artifact.artifact_type ? artifact.artifact_type.replace(/_/g, " ") : "",
        bucketLabel,
    ].filter(Boolean).join(" · ");
    const strategyChip = artifact.strategy_tags && artifact.strategy_tags[0]
        ? `<span class="detail-chip tracker-artifact-chip">${escapeHtml(strategyTagLabel(artifact.strategy_tags[0]))}</span>`
        : "";
    const sectorChip = artifact.sector_tags && artifact.sector_tags[0]
        ? `<span class="detail-chip tracker-artifact-chip">${escapeHtml(sectorTagLabel(artifact.sector_tags[0]))}</span>`
        : "";

    return `
        <div class="tracker-artifact-row${secondary ? " tracker-artifact-row-secondary" : ""}${lowTrust ? " tracker-artifact-row-low-trust" : ""}">
            <div class="tracker-artifact-copy">
                <div class="tracker-artifact-headline">${escapeHtml(artifact.headline || artifact.title || "Untitled artifact")}</div>
                <div class="tracker-artifact-meta">${escapeHtml(artifactMeta)}</div>
                <div class="tracker-artifact-chips">
                    ${sourceLabel}
                    ${strategyChip}
                    ${sectorChip}
                    ${confidenceChip}
                    ${relatedChip}
                </div>
            </div>
            <div class="tracker-artifact-date">${escapeHtml(formatDate(artifact.published_at))}</div>
            <div class="tracker-artifact-actions">
                <a class="row-action-btn${artifact.is_primary ? " primary" : ""}" href="${escapeHtml(trackerArtifactUrl(artifact))}" target="_blank" rel="noopener noreferrer">${escapeHtml(openLabel)}</a>
                ${saveButton}
            </div>
        </div>
    `;
}

function buildTrackerCoverageBucket(title, artifacts, options = {}) {
    if (!artifacts || !artifacts.length) return "";
    const rows = artifacts.map(artifact => buildTrackerArtifactRow(options.campaign, artifact, options)).join("");
    return `
        <div class="tracker-bucket${options.lowTrust ? " tracker-bucket-low-trust" : ""}">
            <div class="tracker-bucket-head">
                <span class="tracker-bucket-title">${escapeHtml(title)}</span>
                <span class="tracker-bucket-count">${artifacts.length} surfaced</span>
            </div>
            <div class="tracker-bucket-body">
                ${rows}
            </div>
        </div>
    `;
}

function buildTrackerTimeline(campaign) {
    const materialEvents = (campaign.events || []).filter(event => event.is_material_node);
    if (!materialEvents.length) {
        return `<div class="tracker-empty-timeline">No material timeline nodes yet. Coverage is attached below until stronger primary evidence arrives.</div>`;
    }

    return `
        <div class="tracker-timeline">
            ${materialEvents.map(event => {
                const previousEvent = findCampaignEvent(campaign, event.previous_event_id);
                const triggerEvent = findCampaignEvent(campaign, event.trigger_event_id);
                const eventEvidenceRank = (event.artifacts || [])[0]?.evidence_rank;
                const primaryArtifacts = (event.artifacts || []).map(artifact => buildTrackerArtifactRow(campaign, artifact)).join("");
                const coverageBucket = buildTrackerCoverageBucket("Related Coverage", event.coverage_artifacts || [], { secondary: true, campaign });
                const eventStrategyChip = event.strategy_tags && event.strategy_tags[0]
                    ? `<span class="detail-chip tracker-artifact-chip">${escapeHtml(strategyTagLabel(event.strategy_tags[0]))}</span>`
                    : "";

                return `
                    <div class="tracker-event">
                        <div class="tracker-event-rail">
                            <span class="tracker-event-dot"></span>
                        </div>
                        <div class="tracker-event-body">
                            <div class="tracker-event-head">
                                <div>
                                    <div class="tracker-event-kicker">
                                        <span>${escapeHtml(TRACKER_EVENT_LABELS[event.event_type] || event.event_type)}</span>
                                        <span>${escapeHtml(event.actor_side || "other")}</span>
                                    </div>
                                    <div class="tracker-event-date">${escapeHtml(formatDate(event.event_date))}</div>
                                </div>
                                <div class="tracker-event-chips">
                                    <span class="detail-chip tracker-materiality-chip">${event.materiality_score} materiality</span>
                                    ${event.event_tags && event.event_tags[0] ? `<span class="detail-chip tracker-artifact-chip">${escapeHtml(eventTagLabel(event.event_tags[0]))}</span>` : ""}
                                    ${eventStrategyChip}
                                    ${eventEvidenceRank ? trackerEvidenceChip(eventEvidenceRank, "tracker-artifact-chip") : ""}
                                </div>
                            </div>
                            ${(previousEvent || triggerEvent) ? `
                                <div class="tracker-event-links">
                                    ${previousEvent ? `<span class="tracker-link-chip">Previous: ${escapeHtml(TRACKER_EVENT_LABELS[previousEvent.event_type] || previousEvent.event_type)}</span>` : ""}
                                    ${triggerEvent ? `<span class="tracker-link-chip">Triggered by: ${escapeHtml(TRACKER_EVENT_LABELS[triggerEvent.event_type] || triggerEvent.event_type)}</span>` : ""}
                                </div>
                            ` : ""}
                            <div class="tracker-event-artifacts">
                                ${primaryArtifacts}
                            </div>
                            ${coverageBucket}
                        </div>
                    </div>
                `;
            }).join("")}
        </div>
    `;
}

function getCampaignRowSaveId(campaign) {
    const artifact = getCampaignRowArtifact(campaign);
    return artifact ? trackerArtifactReadingListId(campaign, artifact) : "";
}

function buildTrackerHeader() {
    return `
        <div class="list-header tracker-grid">
            <span>Activist</span>
            <span>Campaign</span>
            <span class="col-right">Latest Event</span>
            <span class="col-right">Updated</span>
            <span class="col-right">Status</span>
            <span class="col-right">Save</span>
            <span class="col-right">Open</span>
        </div>
    `;
}

function buildTrackerDetailLoading(campaign) {
    if (campaign.detail_error) {
        return '<div class="tracker-empty-timeline">Campaign detail could not be loaded. Try reopening the row.</div>';
    }
    // No detail_path means the publish step didn't write a per-campaign
    // detail file (typically provisional campaigns with only news
    // coverage and no events). Don't spin forever — show what we have.
    if (!campaign.detail_path) {
        return '<div class="tracker-empty-timeline">No extended timeline yet. Coverage articles attach below as they arrive.</div>';
    }
    return '<div class="tracker-empty-timeline">Loading campaign timeline and supporting artifacts…</div>';
}

function buildTrackerRowMarkup(campaign) {
    const isOpen = expandedCampaigns.has(campaign.campaign_id);
    const hasDetails = trackerCampaignHasDetails(campaign);
    const latestEventLabel = TRACKER_EVENT_LABELS[campaign.latest_material_event_type] || campaign.latest_material_event_type || "Campaign Update";
    const saveId = getCampaignRowSaveId(campaign);
    const summaryLine = [
        `${campaign.primary_artifact_count || 0} primary`,
        `${campaign.coverage_count || 0} related`,
        campaign.confirmation_source !== "none"
            ? `confirmed by ${(TRACKER_EVIDENCE_LABELS[campaign.confirmation_source] || campaign.confirmation_source).toLowerCase()}`
            : "awaiting confirmation",
    ].join(" · ");

    return `
        <div class="campaign-group-header tracker-group-header${isOpen ? " expanded" : ""}" data-campaign-key="${escapeHtml(campaign.campaign_id)}" role="button" tabindex="0" aria-expanded="${isOpen}" style="--row-color:${activistColor(campaign.canonical_activist)}">
            <span class="campaign-activist">${escapeHtml(campaign.canonical_activist || "Unknown")}</span>
            <span class="campaign-summary row-summary-with-logo">
                ${renderLogoSlot({ target_company: campaign.canonical_target })}
                <span class="summary-copy">
                    <span class="campaign-target">${escapeHtml(campaign.canonical_target || "Unknown")}</span>
                    <span class="campaign-latest">${escapeHtml(summaryLine)}</span>
                    ${trackerSummaryChips(campaign)}
                </span>
            </span>
            <span class="campaign-meta">${escapeHtml(latestEventLabel)}</span>
            <span class="campaign-range">${escapeHtml(formatDate(campaign.last_updated_at))}</span>
            <span class="campaign-count">${trackerStatusChip(campaign.campaign_status)}</span>
            <span class="campaign-actions">
                ${saveId ? renderSaveButton(saveId) : '<span class="campaign-action-placeholder" aria-hidden="true"></span>'}
                <span class="campaign-toggle" aria-hidden="true">${isOpen ? "−" : "+"}</span>
            </span>
        </div>
        ${isOpen ? `
            <div class="campaign-group-docs tracker-group-docs">
                <div class="campaign-docs-shell tracker-docs-shell">
                    <div class="tracker-detail-top">
                        <div class="tracker-detail-metrics">
                            <div class="tracker-metric">
                                <span class="detail-field-label">First Seen</span>
                                <span class="detail-field-value">${escapeHtml(formatDate(campaign.first_seen_at))}</span>
                            </div>
                            <div class="tracker-metric">
                                <span class="detail-field-label">Last Updated</span>
                                <span class="detail-field-value">${escapeHtml(formatDate(campaign.last_updated_at))}</span>
                            </div>
                            <div class="tracker-metric">
                                <span class="detail-field-label">Origin</span>
                                <span class="detail-field-value">${escapeHtml(TRACKER_EVENT_LABELS[(findCampaignEvent(campaign, campaign.originating_event_id) || {}).event_type] || "Unknown")}</span>
                            </div>
                            <div class="tracker-metric">
                                <span class="detail-field-label">Confirmation</span>
                                <span class="detail-field-value">${trackerEvidenceChip(campaign.confirmation_source === "none" ? "news" : campaign.confirmation_source)}</span>
                            </div>
                        </div>
                        <div class="tracker-detail-summary">
                            <div class="tracker-detail-summary-line">
                                ${trackerStatusChip(campaign.campaign_status)}
                                ${campaign.provisional ? '<span class="detail-chip tracker-provisional-chip">Provisional</span>' : ""}
                                ${renderChipSet(campaign.event_tags || [], eventTagLabel, "detail-chip")}
                                ${renderChipSet((campaign.latest_strategy_tags || campaign.strategy_tags || []).slice(0, 2), strategyTagLabel, "detail-chip")}
                                ${renderChipSet(campaign.sector_tags || [], sectorTagLabel, "detail-chip")}
                                ${renderChipSet(campaign.quality_tags || [], qualityTagLabel, "detail-chip")}
                            </div>
                            <div class="tracker-detail-copy">
                                One campaign row, primary evidence first, related coverage attached underneath the relevant event or campaign bucket.
                            </div>
                        </div>
                    </div>
                    ${hasDetails
                        ? `
                            ${buildTrackerTimeline(campaign)}
                            ${buildTrackerCoverageBucket("Campaign-Level Coverage", campaign.coverage_artifacts || [], { secondary: true, bucketLabel: "Campaign coverage", campaign })}
                            ${buildTrackerCoverageBucket("Low-Trust Attachments", campaign.low_trust_artifacts || [], { secondary: true, lowTrust: true, bucketLabel: "Low-trust match", campaign })}
                        `
                        : buildTrackerDetailLoading(campaign)}
                </div>
            </div>
        ` : ""}
    `;
}

function hydrateTrackerRow(shell) {
    if (shell.dataset.hydrated === "1") return;
    const campaign = trackerCampaignsById.get(shell.dataset.campaignId);
    if (!campaign) return;
    shell.innerHTML = buildTrackerRowMarkup(campaign);
    shell.dataset.hydrated = "1";
    shell.style.minHeight = "";
    syncSaveButtons();
}

function dehydrateTrackerRow(shell) {
    if (shell.dataset.hydrated !== "1") return;
    if (expandedCampaigns.has(shell.dataset.campaignId)) return;
    const h = shell.offsetHeight || TRACKER_ROW_HEIGHT;
    shell.style.minHeight = h + "px";
    shell.innerHTML = "";
    shell.dataset.hydrated = "0";
}

function renderTracker() {
    const container = document.getElementById("list-container");
    if (!trackerLoaded) {
        // Tracker is still being fetched in the background. Show a quiet loading line
        // instead of the "no results" empty state that misleads users on first paint.
        ensureTrackerData(true);
        updateStats([]);
        container.innerHTML = '<div class="empty-state"><span class="empty-state-headline">Loading campaigns…</span></div>';
        return;
    }

    const campaigns = getFilteredTrackerCampaigns();
    updateStats(campaigns);

    if (trackerObserver) { trackerObserver.disconnect(); trackerObserver = null; }

    if (!campaigns.length) {
        container.innerHTML = buildEmptyStateHtml("No campaigns match your tracker filters.");
        trackerCampaignsById.clear();
        return;
    }

    trackerCampaignsById.clear();
    for (const c of campaigns) trackerCampaignsById.set(c.campaign_id, c);

    const placeholders = campaigns.map(c =>
        `<div class="campaign-entry tracker-entry" data-campaign-id="${escapeHtml(c.campaign_id)}" data-hydrated="0" style="min-height:${TRACKER_ROW_HEIGHT}px"></div>`
    ).join("");

    container.innerHTML = buildTrackerHeader() + placeholders;

    trackerObserver = new IntersectionObserver(entries => {
        for (const entry of entries) {
            if (entry.isIntersecting) hydrateTrackerRow(entry.target);
            else dehydrateTrackerRow(entry.target);
        }
    }, { rootMargin: TRACKER_HYDRATE_MARGIN });
    container.querySelectorAll(".tracker-entry").forEach(el => trackerObserver.observe(el));
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
        if (activeTab === "announcements") renderTracker();
        else if (activeTab === "shorts") renderList();
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
        render();
        return;
    }

    const campaignHeader = e.target.closest(".campaign-group-header");
    if (campaignHeader) {
        const key = campaignHeader.dataset.campaignKey;
        const willExpand = !expandedCampaigns.has(key);
        if (expandedCampaigns.has(key)) expandedCampaigns.delete(key);
        else expandedCampaigns.add(key);
        render();
        if (willExpand) {
            ensureTrackerCampaignDetails(key, true).then(() => {
                if (expandedCampaigns.has(key)) render();
            }).catch(() => {
                if (expandedCampaigns.has(key)) render();
            });
        }
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
document.getElementById("filing-scope-filter").addEventListener("change", render);
document.getElementById("filer-role-filter").addEventListener("change", render);
document.getElementById("campaign-status-filter").addEventListener("change", render);
document.getElementById("event-tag-filter").addEventListener("change", render);
document.getElementById("strategy-tag-filter").addEventListener("change", render);
document.getElementById("quality-tag-filter").addEventListener("change", render);
document.getElementById("recency-filter").addEventListener("change", render);
document.getElementById("search-input").addEventListener("input", () => {
    if (activeTab === "announcements") {
        render();
        return;
    }
    // Clear server-side results when user edits — fall back to client-side substring
    if (semanticResultIds) { semanticResultIds = null; }
    if (ftsResultIds) { ftsResultIds = null; }
    if (!semanticMode) render();  // semantic mode waits for Enter
});
document.getElementById("search-input").addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    const q = document.getElementById("search-input").value.trim();
    if (activeTab === "announcements") {
        render();
        return;
    }
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
        const routedUrl = pdfUrl(d);
        const url = routedUrl && routedUrl !== "#"
            ? new URL(routedUrl, window.location.href).href
            : "";
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

            if (d.blob_url) {
                // Blob URLs are public and CORS-friendly, so deployed ZIPs can fetch them directly.
                // Falls back to the proxy w/ original_url if the blob is unreachable
                // (e.g. blob store blocked, deleted, or 403). Without this fallback, a
                // blocked blob store killed every PDF download even though the source
                // SEC/news URL was still valid.
                try {
                    const resp = await fetch(d.blob_url);
                    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                    const blob = await resp.blob();
                    const safeName = (d.title || d.id || "document").replace(/[^a-zA-Z0-9_\- ]/g, "").substring(0, 80);
                    const filename = d.pdf_filename || `${safeName}.pdf`;
                    zip.file(filename, blob);
                    manifestLines.push(`${label}\nFile: ${filename}\nStatus: downloaded (Blob)\nSource: ${d.blob_url}\n`);
                } catch (blobErr) {
                    if (!d.original_url) {
                        manifestLines.push(`${label}\nLink: ${d.blob_url}\nStatus: failed (${blobErr.message})\n`);
                    } else {
                        try {
                            const proxyUrl = `/api/fetch-pdf?url=${encodeURIComponent(d.original_url)}`;
                            const resp = await fetch(proxyUrl);
                            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                            const contentType = resp.headers.get("content-type") || "";
                            const blob = await resp.blob();
                            const isPdf = contentType.includes("pdf");
                            const safeName = (d.title || d.id || "document").replace(/[^a-zA-Z0-9_\- ]/g, "").substring(0, 80);
                            const filename = d.pdf_filename || `${safeName}${isPdf ? ".pdf" : ".html"}`;
                            zip.file(filename, blob);
                            manifestLines.push(`${label}\nFile: ${filename}\nStatus: downloaded (proxy fallback after blob ${blobErr.message})\nSource: ${d.original_url}\n`);
                        } catch (proxyErr) {
                            manifestLines.push(`${label}\nLink: ${d.original_url}\nStatus: failed (blob: ${blobErr.message}, proxy: ${proxyErr.message})\n`);
                        }
                    }
                }
            } else if (!DEPLOY_MODE && d.pdf_filename) {
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
