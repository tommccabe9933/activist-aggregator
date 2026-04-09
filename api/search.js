/**
 * Vercel serverless function: FTS5 full-text search.
 *
 * Usage: GET /api/search?q=proxy+fight+telecom&k=50&mode=fts
 *        GET /api/search?q=board+seat+retailer&k=50&mode=semantic
 *
 * In deploy mode, semantic falls back to FTS since we don't have
 * the ML model. Both modes use the same FTS5 index.
 *
 * Loads data/fts.db (SQLite FTS5) using sql.js (pure JS SQLite).
 */

import initSqlJs from "sql.js";
import { readFileSync } from "fs";
import { join } from "path";

let db = null;

async function getDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  const dbPath = join(process.cwd(), "data", "fts.db");
  const buffer = readFileSync(dbPath);
  db = new SQL.Database(buffer);
  return db;
}

export default async function handler(req, res) {
  const { q, k = "50", mode = "fts" } = req.query;

  if (!q || q.length < 1) {
    return res.status(400).json({ error: "Missing q parameter" });
  }

  const limit = Math.min(Math.max(parseInt(k, 10) || 50, 1), 500);

  try {
    const database = await getDb();
    const t0 = Date.now();

    let results = [];

    // Try FTS5 match query
    try {
      const stmt = database.prepare(
        `SELECT id, bm25(docs) AS score
         FROM docs
         WHERE docs MATCH ?
         ORDER BY score
         LIMIT ?`
      );
      stmt.bind([q, limit]);
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push({ id: row.id, score: Math.round(row.score * 10000) / 10000 });
      }
      stmt.free();
    } catch (e) {
      // Invalid FTS syntax — try as phrase search
      try {
        const stmt = database.prepare(
          `SELECT id, bm25(docs) AS score
           FROM docs
           WHERE docs MATCH ?
           ORDER BY score
           LIMIT ?`
        );
        stmt.bind([`"${q}"`, limit]);
        while (stmt.step()) {
          const row = stmt.getAsObject();
          results.push({ id: row.id, score: Math.round(row.score * 10000) / 10000 });
        }
        stmt.free();
      } catch (e2) {
        results = [];
      }
    }

    const elapsed = (Date.now() - t0) / 1000;

    res.setHeader("Cache-Control", "public, max-age=300");
    return res.json({
      results,
      query: q,
      mode: mode === "semantic" ? "fts-fallback" : "fts",
      elapsed_s: Math.round(elapsed * 1000) / 1000,
    });
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({ error: "Search failed: " + err.message });
  }
}
