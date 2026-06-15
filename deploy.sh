#!/usr/bin/env bash
#
# Build both demos and publish them to GitHub Pages on an orphan `gh-pages`
# branch. The large OnlyOffice asset bundle (assets/) is NOT committed to main;
# it is read from the working tree here and force-pushed as a single-commit
# orphan branch so main history stays small.
#
# Published layout (https://oonxt.github.io/wasm-onlyoffice-demo/):
#   /                -> React demo
#   /vue/            -> Vue demo
#   /v9.3.0.24-1/    -> shared OnlyOffice web-apps + sdkjs + fonts (help/ stripped)
#   /x2t/            -> x2t WASM converter (x2t.js, x2t.wasm)
#
# Usage:  ./deploy.sh
set -euo pipefail

# --- config -----------------------------------------------------------------
REPO_SLUG="oonxt/wasm-onlyoffice-demo"
OO_BASE="/wasm-onlyoffice-demo"        # GitHub Pages base path (repo name)
OO_VERSION="v9.3.0.24-1"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE="$ROOT/build/site"
PUSH_URL="${DEPLOY_PUSH_URL:-https://github.com/${REPO_SLUG}}"

cd "$ROOT"

# --- sanity checks ----------------------------------------------------------
[ -d "assets/${OO_VERSION}" ] || { echo "ERROR: assets/${OO_VERSION} not found"; exit 1; }
[ -d "assets/x2t" ]           || { echo "ERROR: assets/x2t not found"; exit 1; }
[ -d "public/${OO_VERSION}" ] || { echo "ERROR: public/${OO_VERSION} not found"; exit 1; }

# --- build the two demos ----------------------------------------------------
for app in react-demo vue-demo; do
  echo "==> Building $app"
  ( cd "$app" && npm install --no-audit --no-fund && VITE_OO_BASE="$OO_BASE" npm run build )
done

# --- assemble the published site --------------------------------------------
echo "==> Assembling site at $SITE"
rm -rf "$SITE"
mkdir -p "$SITE"

# React at the root, Vue under /vue/
cp -R react-demo/dist/. "$SITE/"
mkdir -p "$SITE/vue"
cp -R vue-demo/dist/. "$SITE/vue/"

# Shared OnlyOffice asset tree (the full bundle), then overlay the base-href'd
# entry HTMLs from public/ (public wins where paths collide).
echo "==> Copying OnlyOffice asset tree"
cp -R "assets/${OO_VERSION}" "$SITE/${OO_VERSION}"
cp -R "public/${OO_VERSION}/." "$SITE/${OO_VERSION}/"

# x2t converter
cp -R assets/x2t "$SITE/x2t"

# Strip the in-editor help docs (~534 MB) to stay under the GitHub Pages 1 GB
# published-site limit. The editors run fine without them.
echo "==> Stripping help/ docs to fit under the 1 GB Pages limit"
find "$SITE/${OO_VERSION}" -type d -name help -path '*/resources/*' -prune -exec rm -rf {} +

# GitHub Pages serves with Jekyll by default, which ignores files/dirs starting
# with "_". OnlyOffice ships such paths, so disable Jekyll.
touch "$SITE/.nojekyll"

echo "==> Site size:" && du -sh "$SITE"

# --- publish to orphan gh-pages branch --------------------------------------
echo "==> Publishing to gh-pages on $PUSH_URL"
(
  cd "$SITE"
  git init -q
  git checkout -q -b gh-pages
  git add -A
  git -c user.name="deploy" -c user.email="deploy@local" commit -qm "Deploy demo to GitHub Pages"
  git push -q -f "$PUSH_URL" gh-pages
)

echo "==> Done. Site: https://oonxt.github.io${OO_BASE}/"
