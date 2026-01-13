import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BUILD_DIR = path.join(ROOT, '.svelte-kit', 'cloudflare');
const MAX_BYTES = 25 * 1024 * 1024;
const EXTS_BLOCKLIST = new Set(['.sqlite', '.sqlite3', '.db']);

function walk(dir, onFile) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, onFile);
    else onFile(p);
  }
}

function main() {
  if (!fs.existsSync(BUILD_DIR)) {
    console.log(`Build directory not found: ${BUILD_DIR}`);
    process.exit(0);
  }
  let removed = 0;
  walk(BUILD_DIR, (filePath) => {
    try {
      const stat = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      if (EXTS_BLOCKLIST.has(ext) || stat.size > MAX_BYTES) {
        fs.rmSync(filePath, { force: true });
        removed++;
        console.log(`Removed asset: ${filePath} (${stat.size} bytes)`);
      }
    } catch {
      // ignore
    }
  });
  console.log(`Strip completed. Removed ${removed} oversized assets.`);
}

main();

