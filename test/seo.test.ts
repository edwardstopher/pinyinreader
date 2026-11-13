import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { pageUrl, routes, sitemapXml } from "../scripts/sitemap.mjs";

const html = readFileSync("index.html", "utf8");
const vercel = readFileSync("vercel.json", "utf8");
const missing = readFileSync("public/404.html", "utf8");
const manifest = readFileSync("public/manifest.webmanifest", "utf8");
const main = readFileSync("src/main.tsx", "utf8");

describe("homepage head and crawlable copy", () => {
  it("targets the converter query and drops keywords", () => {
    expect(html).toContain("<title>Chinese to Pinyin Converter with Definitions &amp; Print | PinyinMe</title>");
    expect(html).toContain('name="description" content="Convert Chinese to pinyin with word-level readings, hover or click definitions, HSK-level pinyin, simplified or traditional characters, and print."');
    expect(html).not.toContain('name="keywords"');
    expect(html).toContain('property="og:image" content="https://www.pinyinme.com/og-image.png"');
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
    expect(html).not.toContain("fonts.googleapis.com");
    expect(html).toContain('rel="manifest" href="/manifest.webmanifest"');
    expect(html).toContain('rel="icon" href="/favicon.ico"');
    expect(html).toContain('rel="apple-touch-icon" href="/apple-touch-icon.png"');
  });

  it("puts one h1, the guide, and a main landmark in the raw HTML", () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("<h1 id=\"page-title\">Add pinyin to Chinese text</h1>");
    expect(html).toContain("<main id=\"page\"");
    expect(html).toContain("银行");
    expect(html).toContain("行走");
    expect(html).toContain("yínháng");
    expect(html).toContain("xíngzǒu");
    expect(html).toContain("<h2>How to convert Chinese to pinyin</h2>");
    expect(html).toContain("<h2>Questions</h2>");
    expect(html).not.toContain("Reserved for a future ad");
  });

  it("describes the app in English structured data", () => {
    expect(html).toContain('"inLanguage": "en"');
    expect(html).not.toContain('"inLanguage": "zh"');
    expect(html).toContain('"@type": "WebSite"');
    expect(html).toContain('"@type": "Organization"');
    expect(html).toContain('"isAccessibleForFree": true');
    expect(html).toContain("Hide pinyin by HSK 2.0 or HSK 3.0 level");
    expect(html).toContain("https://www.pinyinme.com/og-image.png");
  });
});

describe("platform files", () => {
  it("caches hashed assets for a year", () => {
    const config = JSON.parse(vercel) as { headers: { source: string; headers: { key: string; value: string }[] }[] };
    const assets = config.headers.find((item) => item.source === "/assets/(.*)");
    expect(assets?.headers).toEqual([{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]);
  });

  it("ships a branded 404 and a manifest", () => {
    expect(missing).toContain("<h1>Page not found</h1>");
    expect(missing).toContain('href="/"');
    expect(missing).not.toContain("NOT_FOUND");
    const parsed = JSON.parse(manifest) as { name: string; icons: { src: string; sizes: string }[] };
    expect(parsed.name).toBe("PinyinMe");
    expect(parsed.icons.map((icon) => icon.sizes)).toEqual(["192x192", "512x512"]);
  });

  it("builds a sitemap with lastmod and no changefreq", () => {
    const xml = sitemapXml(routes, "2026-11-13");
    expect(xml).toContain("<loc>https://www.pinyinme.com</loc>");
    expect(xml).toContain("<lastmod>2026-11-13</lastmod>");
    expect(xml).not.toContain("changefreq");
    expect(xml).not.toContain("priority");
    expect(pageUrl("/")).toBe("https://www.pinyinme.com");
  });

  it("loads Speed Insights from the Vercel package", () => {
    expect(main).toContain("@vercel/speed-insights/react");
    expect(main).toContain("<SpeedInsights />");
  });
});
