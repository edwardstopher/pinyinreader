import { writeFileSync } from "node:fs";
import { render404, renderPage, sitePages } from "../src/content/site.ts";
import { lastmodFromGit, sitemapXml } from "./sitemap.mjs";

for (const page of sitePages) {
  writeFileSync(new URL(`../${page.file}`, import.meta.url), renderPage(page));
}
writeFileSync(new URL("../public/404.html", import.meta.url), render404());
writeFileSync(
  new URL("../public/sitemap.xml", import.meta.url),
  sitemapXml(sitePages.map((page) => page.path), lastmodFromGit()),
);
console.log(`Wrote ${sitePages.length} pages, 404.html, and sitemap.xml`);
