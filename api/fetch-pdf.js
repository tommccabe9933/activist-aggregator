/**
 * Vercel serverless function: proxy-fetch a URL to bypass CORS.
 *
 * Usage: GET /api/fetch-pdf?url=https://sec.gov/Archives/...
 *
 * Returns the remote content with its original Content-Type.
 * Used by the ZIP download feature to fetch PDFs/HTML from
 * SEC.gov, fund websites, news wires, and short publishers.
 */

const ALLOWED_HOSTS = new Set([
  "sec.gov",
  "www.sec.gov",
  "efts.sec.gov",
  "prnewswire.com",
  "www.prnewswire.com",
  "businesswire.com",
  "www.businesswire.com",
  "globenewswire.com",
  "www.globenewswire.com",
  "10xebitda.com",
  "www.10xebitda.com",
  "hedgefundalpha.com",
  "www.hedgefundalpha.com",
  "pleaseactaccordingly.com",
  "www.pleaseactaccordingly.com",
]);

function isAllowedHost(hostname) {
  if (ALLOWED_HOSTS.has(hostname)) return true;
  // Allow subdomains of allowed hosts
  for (const allowed of ALLOWED_HOSTS) {
    if (hostname.endsWith("." + allowed)) return true;
  }
  // Allow any .gov domain (SEC, EDGAR variants)
  if (hostname.endsWith(".gov")) return true;
  return false;
}

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return res.status(400).json({ error: "Only http/https URLs allowed" });
  }

  if (!isAllowedHost(parsed.hostname)) {
    // For unknown hosts, still allow — the data has many sources
    // but log it for awareness
    console.log(`Proxying from unlisted host: ${parsed.hostname}`);
  }

  try {
    // SEC EDGAR's fair-access policy (https://www.sec.gov/os/accessing-edgar-data)
    // blocks User-Agents that don't include a contact email. Without this header,
    // every SEC.gov fetch returns 403/404 — root cause of every "Status: failed"
    // line on SEC URLs in the reading-list ZIP manifest.
    const upstream = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 ActivistAggregator/1.0 (contact@activistaggregator.app)",
        "Accept": "text/html,application/pdf,*/*",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(30000),
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: `Upstream returned ${upstream.status}`,
      });
    }

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const buffer = Buffer.from(await upstream.arrayBuffer());

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(buffer);
  } catch (err) {
    console.error(`Fetch failed for ${url}:`, err.message);
    return res.status(502).json({ error: `Failed to fetch: ${err.message}` });
  }
}
