#!/usr/bin/env bash
# Rebuilds vendor/tailwind.js from the classes used in index.html.
# Run this after adding Tailwind classes that are not already used elsewhere in the page.
# Needs Node.js + npm (downloads tailwindcss@3.4.17 into a temp folder).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
cd "$TMP"
npm init -y >/dev/null
npm i -s tailwindcss@3.4.17
printf '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n' > in.css
printf 'module.exports={content:[%s]}\n' "\"$ROOT/index.html\"" > tailwind.config.js
npx tailwindcss -c tailwind.config.js -i in.css -o out.css --minify
node -e '
const fs=require("fs");const css=fs.readFileSync("out.css","utf8");
fs.writeFileSync(process.argv[1],"/* Tailwind CSS v3.4.17, precompiled for FastPlay Pro (offline copy). Rebuild with tools/build-vendor.sh after adding new classes. */\n(function(){var s=document.createElement(\"style\");s.id=\"fp-tailwind\";s.textContent="+JSON.stringify(css)+";(document.head||document.documentElement).appendChild(s);})();\n");
' "$ROOT/vendor/tailwind.js"
echo "Wrote $ROOT/vendor/tailwind.js"
