import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { articleWords, render404, renderPage, sitePages } from "../src/content/site";

const app = readFileSync("src/App.tsx", "utf8");
const vercel = JSON.parse(readFileSync("vercel.json", "utf8")) as {
  cleanUrls?: boolean;
  trailingSlash?: boolean;
  rewrites?: unknown;
};

describe("landing pages", () => {
  it("writes each route to its own HTML file", () => {
    for (const page of sitePages) {
      const html = readFileSync(page.file, "utf8");
      expect(html).toBe(renderPage(page));
      expect(html).toContain(`<title>${page.title.replace(/&/g, "&amp;")}</title>`);
      expect(html).toContain(`<h1 id="page-title">${page.h1}</h1>`);
      expect(html).toContain(`<link rel="canonical" href="${page.path === "/" ? "https://www.pinyinme.com" : `https://www.pinyinme.com${page.path}`}">`);
      expect(html).toContain(`https://www.pinyinme.com${page.ogImage}`);
      expect(html.match(/<h1\b/g)).toHaveLength(1);
      expect(html).not.toContain('name="keywords"');
    }
  });

  it("gives each landing 400 to 700 words, an example, and questions", () => {
    for (const page of sitePages.filter((item) => item.sample)) {
      const count = articleWords(page.article);
      expect(count, page.path).toBeGreaterThanOrEqual(400);
      expect(count, page.path).toBeLessThanOrEqual(700);
      expect(page.article).toContain('class="example"');
      expect(page.article).toContain("<h2>Questions</h2>");
      expect(page.sample?.text.length).toBeGreaterThan(0);
    }
  });

  it("links every page from the header, the footer, and the raw HTML", () => {
    expect(app.match(/<PageLinks /g)).toHaveLength(2);
    for (const page of sitePages) {
      const html = readFileSync(page.file, "utf8");
      for (const other of sitePages) {
        expect(html).toContain(`href="${other.path}"`);
      }
    }
  });

  it("keeps clean URLs and a real 404", () => {
    expect(vercel.cleanUrls).toBe(true);
    expect(vercel.trailingSlash).toBe(false);
    expect(vercel.rewrites).toBeUndefined();
    const missing = readFileSync("public/404.html", "utf8");
    expect(missing).toBe(render404());
    expect(missing).toContain("<h1>Page not found</h1>");
    for (const page of sitePages) expect(missing).toContain(`href="${page.path}"`);
  });
});
