import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

export const SITE = "https://www.pinyinme.com";

/** Paths without a trailing slash. "/" is the apex URL with no path. */
export const routes = ["/"];

export function pageUrl(path) {
  if (path === "/") return SITE;
  return `${SITE}${path}`;
}

export function sitemapXml(paths, lastmod) {
  const urls = paths.map((path) => `  <url>\n    <loc>${pageUrl(path)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function lastmodFromGit() {
  try {
    const date = execSync("git log -1 --format=%cs", { encoding: "utf8" }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  } catch {
    // A build without a git checkout still needs a sitemap.
  }
  return new Date().toISOString().slice(0, 10);
}

const invoked = process.argv[1]?.endsWith("sitemap.mjs");
if (invoked) {
  const xml = sitemapXml(routes, lastmodFromGit());
  writeFileSync(new URL("../public/sitemap.xml", import.meta.url), xml);
}
