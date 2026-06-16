/*
 * gen-d1-sql.cjs — one-time helper: turn migration/kv-configs.json (the Mongo
 * export, [{key:"cfg:<uid>", value:"<json>"}]) into chunked SQL files for the
 * D1 `configs` table, runnable with `wrangler d1 execute --file`.
 *
 * D1 caps a single SQL statement at ~100 KB, but some payloads reach 1 MB, so a
 * large value is written as one INSERT of the first piece followed by
 * `UPDATE ... SET data = data || '<piece>'` appends — every statement stays
 * small. Output files are executed in order, so a value whose statements span
 * two files still reconstructs correctly.
 *
 *   node scripts/gen-d1-sql.cjs
 *   wrangler d1 execute f1manager-calc-db --remote --file=migration/d1-configs-1.sql -y
 */
const fs = require("fs");
const path = require("path");

const SRC = path.resolve(__dirname, "..", "migration", "kv-configs.json");
const OUT_DIR = path.resolve(__dirname, "..", "migration");
const PIECE = 50000; // raw chars per inlined string piece (well under the ~100 KB stmt cap)
const FILE_MAX = 35 * 1024 * 1024;

const a = JSON.parse(fs.readFileSync(SRC, "utf8"));
const best = new Map();
for (const e of a) {
  const uid = e.key.replace(/^cfg:/, "");
  const c = best.get(uid);
  if (!c || e.value.length > c.length) best.set(uid, e.value);
}

const esc = (s) => s.replace(/'/g, "''");

// Split into <=PIECE code units without breaking a surrogate pair.
function splitPieces(s) {
  const out = [];
  let i = 0;
  while (i < s.length) {
    let end = Math.min(i + PIECE, s.length);
    if (end < s.length) {
      const code = s.charCodeAt(end - 1);
      if (code >= 0xd800 && code <= 0xdbff) end -= 1; // don't end on a high surrogate
    }
    out.push(s.slice(i, end));
    i = end;
  }
  return out;
}

function statementsFor(uid, val) {
  const u = esc(uid);
  const pieces = splitPieces(val);
  const stmts = [`INSERT OR REPLACE INTO configs (uid, data, updated_at) VALUES ('${u}', '${esc(pieces[0])}', 0);`];
  for (let k = 1; k < pieces.length; k++) {
    stmts.push(`UPDATE configs SET data = data || '${esc(pieces[k])}' WHERE uid = '${u}';`);
  }
  return stmts;
}

// Clear any stale output from a previous run.
for (const f of fs.readdirSync(OUT_DIR)) {
  if (/^d1-configs-\d+\.sql$/.test(f)) fs.unlinkSync(path.join(OUT_DIR, f));
}

const uids = [...best.keys()];
let fileN = 0;
let buf = [];
let bufBytes = 0;
let totalStmts = 0;
const flush = () => {
  if (!buf.length) return;
  fileN++;
  const f = path.join(OUT_DIR, `d1-configs-${fileN}.sql`);
  fs.writeFileSync(f, buf.join("\n") + "\n");
  console.log(`${path.basename(f)}: ${buf.length} statements, ${(fs.statSync(f).size / 1048576).toFixed(1)} MB`);
  buf = [];
  bufBytes = 0;
};
for (const uid of uids) {
  for (const st of statementsFor(uid, best.get(uid))) {
    if (bufBytes + st.length > FILE_MAX && buf.length) flush();
    buf.push(st);
    bufBytes += st.length + 1;
    totalStmts++;
  }
}
flush();
console.log(`total uids: ${uids.length} | statements: ${totalStmts} | files: ${fileN}`);
