// Post-build script: generate index.html for Vercel static serving.
// TanStack Start + Cloudflare outputs no index.html, so we create one
// that bootstraps the client bundle (SPA fallback for Vercel).
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const assetsDir = join(process.cwd(), "dist/client/assets");
const files = readdirSync(assetsDir);

// Main app bundle is the largest .js file (the Vite entry chunk)
const jsBundles = files.filter(f => f.endsWith(".js"));
const mainJs = jsBundles
  .map(f => ({ name: f, size: 0 }))
  .sort((a, b) => {
    // Sort by filename — the main bundle is the one that starts with "index-" and is largest
    const aIsIndex = a.name.startsWith("index-");
    const bIsIndex = b.name.startsWith("index-");
    if (aIsIndex !== bIsIndex) return bIsIndex ? 1 : -1;
    return a.name.localeCompare(b.name);
  })[0]?.name;

const cssFiles = files.filter(f => f.endsWith(".css"));
const mainCss = cssFiles[0];

if (!mainJs) {
  console.error("Could not find main JS bundle in dist/client/assets/");
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MyRideNepal — Nepal's Trusted Bike &amp; Scooter Marketplace</title>
    <meta name="description" content="Buy and sell motorcycles and scooters in Nepal. Find trusted sellers across Kathmandu, Pokhara and beyond." />
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.ico" />
    ${mainCss ? `<link rel="stylesheet" crossorigin href="/assets/${mainCss}" />` : ""}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" crossorigin src="/assets/${mainJs}"></script>
  </body>
</html>`;

writeFileSync(join(process.cwd(), "dist/client/index.html"), html);
console.log(`Generated dist/client/index.html (entry: ${mainJs})`);
