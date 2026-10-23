#!/usr/bin/env node
// Builds copy-paste setup scripts for the whole project into train-share/:
//   railbook-setup.mjs / .sh / .ps1   one file with everything, for a new machine
//   railbook-update.mjs               applies this version onto an existing copy
//   parts/railbook-part-N-of-M.mjs    the Node script split into paste-sized pieces
//   HOW-TO-SETUP.md                   instructions
// Run: npm run share
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = process.cwd();
const NAME = "railbook";
/** package.json names this project has had. Copies made by the old setup.mjs use the second one. */
const KNOWN_NAMES = [NAME, "train-ticket-system"];
const TITLE = "RailBook - Train Ticket Booking";
const OUT_DIR = "train-share";
const OUT = join(ROOT, OUT_DIR);
const MANIFEST = `.${NAME}-files.json`;
const PART_LIMIT = 90 * 1024; // max base64 payload per part, so each part pastes cleanly into codeshare
/** Files earlier versions shipped and this one doesn't. The update script deletes them if present. */
const OBSOLETE = [
  // Admin pages moved into src/app/(routes)/admin/(dashboard)/ behind the admin login.
  "src/app/(routes)/admin/coaches/page.tsx",
  "src/app/(routes)/admin/layout.tsx",
  "src/app/(routes)/admin/page.tsx",
  "src/app/(routes)/admin/seats/page.tsx",
  "src/app/(routes)/admin/stations/page.tsx",
  "src/app/(routes)/admin/trains/page.tsx",
  // Replaced by src/proxy.ts, src/data/trains.ts and the new home page.
  "src/app/middleware.ts",
  "src/components/common/Banner.tsx",
  "src/constants/train.ts",
];

const SKIP_DIRS = new Set(["node_modules", ".next", "out", "build", OUT_DIR, ".git", ".vercel", "coverage"]);
// setup.mjs is the old single-file generator; these scripts replace it.
const SKIP_FILES = new Set(["next-env.d.ts", ".DS_Store", "npm-debug.log", MANIFEST, "setup.mjs"]);
const isSkipped = (name) => SKIP_FILES.has(name) || name.endsWith(".tsbuildinfo") || (name.startsWith(".env") && name !== ".env.example");
const BINARY = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".woff", ".woff2", ".mp3", ".wav", ".pdf"]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...walk(join(dir, entry.name)));
    } else if (entry.isFile() && !isSkipped(entry.name)) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

const files = walk(ROOT)
  .map((abs) => {
    const p = relative(ROOT, abs).split(sep).join("/");
    const buf = readFileSync(abs);
    const binary = BINARY.has(extname(p).toLowerCase());
    return {
      p,
      buf,
      e: binary ? "base64" : "utf8",
      c: buf.toString(binary ? "base64" : "utf8"),
      h: createHash("sha256").update(buf).digest("hex"),
    };
  })
  .sort((a, b) => a.p.localeCompare(b.p));

const wrap = (b64) => b64.replace(/.{100}/g, "$&\n");
const pack = (list) =>
  wrap(gzipSync(Buffer.from(JSON.stringify({ files: list.map(({ p, e, c, h }) => ({ p, e, c, h })) })), { level: 9 }).toString("base64"));

// ---------- tar (ustar) for the bash and PowerShell scripts ----------
function tarHeader(path, size) {
  const h = Buffer.alloc(512);
  let name = path, prefix = "";
  if (Buffer.byteLength(path) > 100) {
    const cut = path.lastIndexOf("/", 155);
    prefix = path.slice(0, cut);
    name = path.slice(cut + 1);
  }
  const put = (str, off, len) => h.write(str, off, len, "utf8");
  const oct = (n, len) => n.toString(8).padStart(len - 1, "0") + "\0";
  put(name, 0, 100);
  put(oct(0o644, 8), 100, 8);
  put(oct(0, 8), 108, 8);
  put(oct(0, 8), 116, 8);
  put(oct(size, 12), 124, 12);
  put(oct(Math.floor(Date.now() / 1000), 12), 136, 12);
  put("        ", 148, 8); // checksum placeholder
  put("0", 156, 1);
  put("ustar\0", 257, 6);
  put("00", 263, 2);
  put(prefix, 345, 155);
  let sum = 0;
  for (const b of h) sum += b;
  put(sum.toString(8).padStart(6, "0") + "\0 ", 148, 8);
  return h;
}
function tarGz(list) {
  const chunks = [];
  for (const f of list) {
    chunks.push(tarHeader(f.p, f.buf.length), f.buf);
    const pad = (512 - (f.buf.length % 512)) % 512;
    if (pad) chunks.push(Buffer.alloc(pad));
  }
  chunks.push(Buffer.alloc(1024));
  return wrap(gzipSync(Buffer.concat(chunks), { level: 9 }).toString("base64"));
}

const TOP_LEVEL = JSON.stringify([...new Set(files.map((f) => f.p.split("/")[0]))].sort());
const NEXT_STEPS = [
  "npm ci",
  "npm run dev   and open http://localhost:3000",
  "Admin: http://localhost:3000/admin/login  (admin@railbook.in / admin123)",
  "Optional: copy .env.example to .env.local and set DATABASE_URL for PostgreSQL",
];

// ---------- Node setup script (also used for each part) ----------
function nodeScript({ title, list, data }) {
  return `#!/usr/bin/env node
// ${TITLE} - ${title} (${list.length} files). Generated ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC.
// New machine: put this file in an empty folder and run  node <this file>  (then follow the printed steps)
// Existing copy: run it inside the project folder to overwrite files with this version.
// Run:   node <this file> [target-folder] [--force]
// Needs Node.js 18 or newer to run this script (20.9+ to run the site). Uses only built-in modules.
const PROJECT_ENTRIES = new Set(${TOP_LEVEL});
const KNOWN_NAMES = ${JSON.stringify(KNOWN_NAMES)};
const DATA = \`
${data}
\`;

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { gunzipSync } from "node:zlib";

const args = process.argv.slice(2);
const force = args.includes("--force");
const pathArg = args.find((a) => !a.startsWith("--"));
let target = pathArg ? resolve(pathArg) : process.cwd();
if (!pathArg && !existsSync(join(target, "package.json")) && existsSync(join(target, "${NAME}", "package.json"))) target = join(target, "${NAME}");

// Refuse to write over a different project by mistake.
const pkgPath = join(target, "package.json");
if (existsSync(pkgPath) && !force) {
  let name = "";
  try {
    name = JSON.parse(readFileSync(pkgPath, "utf8")).name;
  } catch {}
  if (!KNOWN_NAMES.includes(name)) {
    console.error("This folder has a package.json for \\"" + name + "\\", not RailBook: " + target);
    console.error("Run this in an empty folder or in the RailBook project, or add --force.");
    process.exit(1);
  }
}
// The manifest is allowed so that parts 2..N can run after part 1 wrote it.
if (!existsSync(pkgPath) && existsSync(target) && readdirSync(target).some((f) => !f.endsWith(".mjs") && f !== "${MANIFEST}" && !PROJECT_ENTRIES.has(f)) && !force) {
  console.error("The folder " + target + " is not empty and is not the RailBook project.");
  console.error("Use an empty folder, pass the project path as an argument, or add --force.");
  process.exit(1);
}

let payload;
try {
  payload = JSON.parse(gunzipSync(Buffer.from(DATA.replace(/\\s+/g, ""), "base64")).toString("utf8"));
} catch {
  console.error("This script is damaged (the paste was probably cut off or changed). Copy it again in full.");
  process.exit(1);
}

console.log("${TITLE} - ${title}\\nFolder: " + target + "\\n");
let written = 0, unchanged = 0;
for (const f of payload.files) {
  const dest = join(target, f.p);
  const data = Buffer.from(f.c, f.e);
  if (existsSync(dest) && readFileSync(dest).equals(data)) {
    unchanged++;
    continue;
  }
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, data);
  written++;
  console.log("  wrote  " + f.p);
}
const bad = payload.files.filter((f) => {
  const dest = join(target, f.p);
  return !existsSync(dest) || createHash("sha256").update(readFileSync(dest)).digest("hex") !== f.h;
});
console.log("\\nDone: " + written + " written, " + unchanged + " already up to date.");
if (bad.length) {
  console.error("WARNING: these files did not verify: " + bad.map((f) => f.p).join(", "));
  process.exit(1);
}
console.log("All " + payload.files.length + " files verified.");
const manifestPath = join(target, "${MANIFEST}");
let known = [];
try {
  known = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch {}
writeFileSync(manifestPath, JSON.stringify([...new Set([...known, ...payload.files.map((f) => f.p)])].sort(), null, 1) + "\\n");
const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 20 || (major === 20 && minor < 9)) console.warn("\\nNote: the site needs Node.js 20.9+ to run. You have " + process.versions.node + ".");
console.log("\\nNext:\\n${NEXT_STEPS.map((s, i) => `  ${i + 1}. ${s}`).join("\\n")}");
`;
}

// ---------- Node update script ----------
function updateScript({ list, data }) {
  return `#!/usr/bin/env node
// ${TITLE} - UPDATE (${list.length} files). Brings an existing copy of RailBook up to this version.
// Run inside the project folder:  node ${NAME}-update.mjs   (or pass the folder path)
// Options: --dry-run (show what would change), --no-install (skip npm install), --keep (don't delete dropped files)
const KNOWN_NAMES = ${JSON.stringify(KNOWN_NAMES)};
const DATA = \`
${data}
\`;

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, rmdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { gunzipSync } from "node:zlib";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const noInstall = args.includes("--no-install");
const keep = args.includes("--keep");
const pathArg = args.find((a) => !a.startsWith("--"));

const isProject = (dir) => {
  try {
    return KNOWN_NAMES.includes(JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).name) && existsSync(join(dir, "src"));
  } catch {
    return false;
  }
};
let target = pathArg ? resolve(pathArg) : process.cwd();
if (!pathArg && !isProject(target) && isProject(join(target, "${NAME}"))) target = join(target, "${NAME}");
if (!isProject(target)) {
  console.error("Could not find the RailBook project in: " + target);
  console.error("Run this inside the project folder (the one with package.json and src), or pass its path.");
  console.error("Setting up a new machine? Use ${NAME}-setup.mjs instead.");
  process.exit(1);
}

let payload;
try {
  payload = JSON.parse(gunzipSync(Buffer.from(DATA.replace(/\\s+/g, ""), "base64")).toString("utf8"));
} catch {
  console.error("This script is damaged (the paste was probably cut off or changed). Copy it again in full.");
  process.exit(1);
}

console.log("${TITLE} - update" + (dryRun ? " (dry run, nothing is changed)" : "") + "\\nProject: " + target + "\\n");
const read = (p) => (existsSync(join(target, p)) ? readFileSync(join(target, p)) : null);
const before = { pkg: read("package.json"), lock: read("package-lock.json") };

let written = 0, unchanged = 0, removed = 0;
for (const f of payload.files) {
  const dest = join(target, f.p);
  const data = Buffer.from(f.c, f.e);
  if (existsSync(dest) && readFileSync(dest).equals(data)) {
    unchanged++;
    continue;
  }
  written++;
  console.log("  " + (existsSync(dest) ? "updated" : "added  ") + "  " + f.p);
  if (dryRun) continue;
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, data);
}

// Remove files an earlier version installed that this one no longer has. Only files listed in the manifest
// (or known obsolete files) are touched, so your own files and .env files are never deleted.
const manifestPath = join(target, "${MANIFEST}");
let previous = [];
try {
  previous = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch {}
const current = new Set(payload.files.map((f) => f.p));
if (!keep) {
  for (const p of [...new Set([...previous, ...${JSON.stringify(OBSOLETE)}])]) {
    if (current.has(p) || p.startsWith(".env")) continue;
    const dest = join(target, p);
    if (!existsSync(dest)) continue;
    removed++;
    console.log("  removed  " + p);
    if (dryRun) continue;
    rmSync(dest, { force: true });
    for (let dir = dirname(dest); dir.length > target.length; dir = dirname(dir)) {
      try {
        if (readdirSync(dir).length) break;
        rmdirSync(dir);
      } catch {
        break;
      }
    }
  }
}

if (dryRun) {
  console.log("\\nDry run: " + written + " to write, " + removed + " to remove, " + unchanged + " already up to date.");
  process.exit(0);
}
writeFileSync(manifestPath, JSON.stringify([...current].sort(), null, 1) + "\\n");

const bad = payload.files.filter((f) => {
  const dest = join(target, f.p);
  return !existsSync(dest) || createHash("sha256").update(readFileSync(dest)).digest("hex") !== f.h;
});
console.log("\\nDone: " + written + " written, " + removed + " removed, " + unchanged + " already up to date.");
if (bad.length) {
  console.error("WARNING: these files did not verify: " + bad.map((f) => f.p).join(", "));
  process.exit(1);
}
console.log("All " + payload.files.length + " files verified.");

const depsChanged = !before.pkg?.equals(read("package.json")) || !before.lock?.equals(read("package-lock.json"));
if ((depsChanged || !existsSync(join(target, "node_modules"))) && !noInstall) {
  console.log("\\nPackages changed, running npm install...\\n");
  const r = spawnSync("npm install --no-audit --no-fund", { cwd: target, stdio: "inherit", shell: true });
  if (r.status !== 0) {
    console.error("\\nnpm install failed. Run it yourself in " + target);
    process.exit(1);
  }
}
console.log("\\nUpdated. Start it with:  npm run dev");
`;
}

// ---------- Bash setup script ----------
function bashScript(list, data) {
  const sums = list.map((f) => `${f.h}  ${f.p}`).join("\n");
  const nameCheck = KNOWN_NAMES.map((n) => `-e '"name": "${n}"'`).join(" ");
  return `#!/usr/bin/env bash
# ${TITLE} - full setup (${list.length} files). Generated ${new Date().toISOString().slice(0, 10)}.
# Run:  bash ${NAME}-setup.sh [target-folder] [--force]
# Needs base64, tar and gzip (macOS, Linux and Git Bash have them). Node.js 20.9+ is needed to run the site.
set -euo pipefail
TARGET="."
FORCE=0
for a in "$@"; do
  case "$a" in
    --force) FORCE=1 ;;
    *) TARGET="$a" ;;
  esac
done
mkdir -p "$TARGET"
if [ -f "$TARGET/package.json" ] && ! grep -q ${nameCheck} "$TARGET/package.json" && [ "$FORCE" = 0 ]; then
  echo "This folder holds a different project: $TARGET. Use an empty folder or add --force." >&2
  exit 1
fi
decode() { base64 -d 2>/dev/null || base64 -D; }
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
decode > "$TMP" <<'PAYLOAD'
${data}
PAYLOAD
if ! tar -xzf "$TMP" -C "$TARGET"; then
  echo "This script is damaged (the paste was probably cut off or changed). Copy it again in full." >&2
  exit 1
fi
echo "Wrote ${list.length} files to $TARGET"
if command -v sha256sum >/dev/null; then SUM="sha256sum"; elif command -v shasum >/dev/null; then SUM="shasum -a 256"; else SUM=""; fi
if [ -n "$SUM" ]; then
  (cd "$TARGET" && $SUM -c --quiet) <<'SUMS'
${sums}
SUMS
  echo "All ${list.length} files verified."
fi
printf '\\nNext:\\n${NEXT_STEPS.map((s, i) => `  ${i + 1}. ${s}`).join("\\n")}\\n'
`;
}

// ---------- PowerShell setup script ----------
function psScript(list, data) {
  const sums = list.map((f) => `  @("${f.p}", "${f.h}")`).join(",\n");
  const namePattern = KNOWN_NAMES.map((n) => `"name": "${n}"`).join("|");
  return `# ${TITLE} - full setup (${list.length} files). Generated ${new Date().toISOString().slice(0, 10)}.
# Run:  powershell -ExecutionPolicy Bypass -File .\\${NAME}-setup.ps1 [-Target folder] [-Force]
# Needs Windows 10 or newer (for tar.exe). Node.js 20.9+ is needed to run the site.
param([string]$Target = ".", [switch]$Force)
$ErrorActionPreference = "Stop"
$data = @'
${data}
'@
$hashes = @(
${sums}
)
New-Item -ItemType Directory -Force -Path $Target | Out-Null
$Target = (Resolve-Path $Target).Path
$pkg = Join-Path $Target "package.json"
if ((Test-Path $pkg) -and -not $Force -and -not (Select-String -Path $pkg -Pattern '${namePattern}' -Quiet)) {
  Write-Error "This folder holds a different project: $Target. Use an empty folder or add -Force."
}
$tmp = [IO.Path]::GetTempFileName()
try {
  [IO.File]::WriteAllBytes($tmp, [Convert]::FromBase64String(($data -replace '\\s', '')))
  # Prefer Windows' own tar: a GNU tar earlier on PATH (e.g. from Git) reads "C:\\..." as a remote host.
  $winTar = Join-Path $env:SystemRoot "System32\\tar.exe"
  if (Test-Path $winTar) { & $winTar -xzf $tmp -C $Target } else { tar --force-local -xzf $tmp -C $Target }
  if ($LASTEXITCODE -ne 0) { throw "tar failed" }
} catch {
  Write-Error "This script is damaged (the paste was probably cut off or changed). Copy it again in full."
} finally {
  Remove-Item $tmp -ErrorAction SilentlyContinue
}
$bad = @()
foreach ($h in $hashes) {
  $f = Join-Path $Target $h[0]
  if (-not (Test-Path -LiteralPath $f) -or (Get-FileHash -LiteralPath $f -Algorithm SHA256).Hash.ToLower() -ne $h[1]) { $bad += $h[0] }
}
if ($bad.Count) { Write-Error ("These files did not verify: " + ($bad -join ", ")) }
Write-Host "Wrote and verified ${list.length} files in $Target"
Write-Host ""
Write-Host "Next:"
${NEXT_STEPS.map((s, i) => `Write-Host "  ${i + 1}. ${s}"`).join("\n")}
`;
}

// ---------- write everything ----------
rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "parts"), { recursive: true });

const fullData = pack(files);
const tarData = tarGz(files);
writeFileSync(join(OUT, `${NAME}-setup.mjs`), nodeScript({ title: "full setup", list: files, data: fullData }));
writeFileSync(join(OUT, `${NAME}-update.mjs`), updateScript({ list: files, data: fullData }));
writeFileSync(join(OUT, `${NAME}-setup.sh`), bashScript(files, tarData).replace(/\r\n/g, "\n"));
writeFileSync(join(OUT, `${NAME}-setup.ps1`), psScript(files, tarData));

// Parts: greedily fill each part up to the size limit (largest files first, so big ones get their own part).
const parts = [];
for (const f of [...files].sort((a, b) => b.c.length - a.c.length)) {
  const home = parts.find((part) => pack([...part, f]).length <= PART_LIMIT);
  if (home) home.push(f);
  else parts.push([f]);
}
parts.forEach((p) => p.sort((a, b) => a.p.localeCompare(b.p)));
const partNames = parts.map((_, i) => `${NAME}-part-${i + 1}-of-${parts.length}.mjs`);
parts.forEach((list, i) => {
  writeFileSync(join(OUT, "parts", partNames[i]), nodeScript({ title: `part ${i + 1} of ${parts.length}`, list, data: pack(list) }));
});

const size = (f) => `${Math.round(statSync(join(OUT, f)).size / 1024)} KB`;
const partRows = partNames.map((n, i) => `| \`parts/${n}\` | ${size(join("parts", n))} | ${parts[i].length} files |`).join("\n");

writeFileSync(
  join(OUT, "HOW-TO-SETUP.md"),
  `# ${TITLE} - set up or update on another machine

A Next.js train booking app: search, booking flow, PNR and live status, a chat booking assistant and an admin
dashboard, all running on dummy data until PostgreSQL is wired in.
How the code works is documented in \`docs/README.md\` (included in these scripts).

These scripts contain the whole project (${files.length} files, compressed). Generated ${new Date().toISOString().slice(0, 10)} with \`npm run share\`.
Each one checks every file with SHA-256 after writing it.

Not included: \`node_modules\`, \`.next\`, \`.git\` and \`.env*\` files (except \`.env.example\`).

## New machine (${size(`${NAME}-setup.mjs`)})

1. Create an empty folder (e.g. \`railbook\`) and copy \`${NAME}-setup.mjs\` into it.
2. In a terminal in that folder:

\`\`\`bash
node ${NAME}-setup.mjs
npm ci
npm run dev
\`\`\`

Then open http://localhost:3000. Needs Node.js 20.9 or newer (\`node -v\`).
The admin dashboard is at http://localhost:3000/admin/login (demo login \`admin@railbook.in\` / \`admin123\`).

No Node yet? Use \`${NAME}-setup.sh\` (${size(`${NAME}-setup.sh`)}, macOS / Linux / Git Bash: \`bash ${NAME}-setup.sh\`) or
\`${NAME}-setup.ps1\` (${size(`${NAME}-setup.ps1`)}, Windows: \`powershell -ExecutionPolicy Bypass -File .\\${NAME}-setup.ps1\`) to get the
files, then install Node to run the site.

## Update an existing copy (${size(`${NAME}-update.mjs`)})

Works on copies made by these scripts and on copies made by the old \`setup.mjs\` (package name \`train-ticket-system\`).

1. Copy \`${NAME}-update.mjs\` into the project folder (the one with \`package.json\`).
2. Preview, then apply:

\`\`\`bash
node ${NAME}-update.mjs --dry-run
node ${NAME}-update.mjs
npm run dev
\`\`\`

It overwrites project files with this version (local edits to those files are replaced), deletes files this
version no longer uses (only files an earlier script installed; add \`--keep\` to keep them), and runs
\`npm install\` when packages changed (\`--no-install\` to skip). Your other files are left alone.
If the copy is a git repo, commit first so you can review the diff.

## ${parts.length} smaller parts (easier to paste through codeshare)

| Part | Size | Contains |
| --- | --- | --- |
${partRows}

For each part: paste it into a new file with exactly the same name in the project folder, then run it, e.g.
\`node ${partNames[0]}\`. Parts can run in any order, but run all ${parts.length}. Then continue with \`npm ci\` above.

## Troubleshooting

- \`This script is damaged\`: the paste was cut off. Copy that file again in full.
- \`The folder ... is not empty\`: you are in another folder. \`cd\` into an empty one, or pass a path:
  \`node ${NAME}-setup.mjs "path/to/folder"\`.
- \`npm ci\` fails: delete \`node_modules\` and try again, or use \`npm install\`.
- Font or TLS errors behind a corporate proxy: fonts are bundled from npm, so the app itself makes no font
  requests. If \`npm ci\` fails on TLS, ask IT for the proxy certificate and set \`NODE_EXTRA_CA_CERTS\`.

Delete the setup files from the project folder afterwards. This \`${OUT_DIR}\` folder is ignored by git.
`,
);

console.log(`${files.length} files packed into ${OUT_DIR}/`);
for (const f of [`${NAME}-setup.mjs`, `${NAME}-setup.sh`, `${NAME}-setup.ps1`, `${NAME}-update.mjs`]) console.log(`  ${f.padEnd(28)} ${size(f)}`);
partNames.forEach((n, i) => console.log(`  parts/${n.padEnd(22)} ${size(join("parts", n))} (${parts[i].length} files)`));
