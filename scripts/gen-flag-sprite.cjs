// Generates public/flags.svg — a single SVG sprite of all flags in assets/flags/.
// Each flag becomes a <symbol id="flag-<CODE>">; internal ids are namespaced so
// gradients/masks don't collide. Run: node scripts/gen-flag-sprite.cjs
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "assets", "flags");
const out = path.join(__dirname, "..", "public", "flags.svg");

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".svg"));
let symbols = "";
for (const f of files) {
  const code = f.replace(/\.svg$/, "");
  let svg = fs.readFileSync(path.join(dir, f), "utf8");
  const vb = (svg.match(/viewBox="([^"]+)"/) || [, "0 0 21 15"])[1];
  let inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  inner = inner.replace(/<title>[\s\S]*?<\/title>/g, "").replace(/<desc>[\s\S]*?<\/desc>/g, "");
  const prefix = "f" + code.replace(/[^a-zA-Z0-9]/g, "_") + "-";
  const ids = [...inner.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  for (const id of ids) {
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    inner = inner.replace(new RegExp('id="' + esc + '"', "g"), 'id="' + prefix + id + '"');
    inner = inner.replace(new RegExp("url\\(#" + esc + "\\)", "g"), "url(#" + prefix + id + ")");
    inner = inner.replace(new RegExp('(xlink:href|href)="#' + esc + '"', "g"), '$1="#' + prefix + id + '"');
  }
  symbols += `<symbol id="flag-${code}" viewBox="${vb}">${inner.trim()}</symbol>`;
}
const sprite = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">${symbols}</svg>`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, sprite);
console.log(`wrote ${out}: ${files.length} symbols, ${(sprite.length / 1024).toFixed(1)} KB`);
