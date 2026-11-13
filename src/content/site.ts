import type { Settings } from "../model";
import {
  converterArticle,
  homeArticle,
  hskArticle,
  printArticle,
  readerArticle,
  traditionalArticle,
} from "./copy.ts";

export type SampleSettings = Partial<Omit<Settings, "print">> & { print?: Partial<Settings["print"]> };

export type Sample = {
  id: string;
  title: string;
  text: string;
  settings?: SampleSettings;
};

export type SitePage = {
  id: string;
  path: string;
  file: string;
  nav: string;
  title: string;
  description: string;
  h1: string;
  summary: string;
  ogImage: string;
  ogAlt: string;
  article: string;
  sample?: Sample;
};

const handout: SampleSettings = {
  position: "above",
  hanFont: "song",
  pyFont: "serif",
  toneColor: "off",
  hanSize: 22,
  pySize: 12,
  theme: "light",
  hskHide: 0,
  print: { presetId: "handout", toneMode: "grayscale" },
};

export const sitePages: SitePage[] = [
  {
    id: "home",
    path: "/",
    file: "index.html",
    nav: "Home",
    title: "Chinese to Pinyin Converter with Definitions & Print | PinyinMe",
    description: "Convert Chinese to pinyin with word-level readings, hover or click definitions, HSK-level pinyin, simplified or traditional characters, and print.",
    h1: "Add pinyin to Chinese text",
    summary: "Chinese to pinyin — how it works and common questions",
    ogImage: "/og-image.png",
    ogAlt: "PinyinMe showing 银行 yínháng and 行走 xíngzǒu, with pinyin above the characters.",
    article: homeArticle,
  },
  {
    id: "chinese-to-pinyin",
    path: "/chinese-to-pinyin",
    file: "chinese-to-pinyin.html",
    nav: "Chinese to pinyin",
    title: "Chinese to Pinyin Converter | PinyinMe",
    description: "Convert characters to word-level pinyin with tone marks, then look a word up or print the page. Free, in your browser, no account.",
    h1: "Chinese to pinyin, word by word",
    summary: "Convert Chinese to pinyin — steps, tones, and a polyphonic example",
    ogImage: "/og-chinese-to-pinyin.png",
    ogAlt: "PinyinMe card with 银行 yínháng and 行走 xíngzǒu.",
    article: converterArticle,
    sample: {
      id: "sample-chinese-to-pinyin",
      title: "银行和行走",
      text: "银行在图书馆旁边。我想去那儿走走。\n\n行走比坐车慢，可是路上可以看到更多。",
      settings: { position: "below", hskHide: 0, toneFormat: "marks", toneColor: "pinyin", dictTrigger: "click" },
    },
  },
  {
    id: "pinyin-for-printing",
    path: "/pinyin-for-printing",
    file: "pinyin-for-printing.html",
    nav: "Printing",
    title: "Print Chinese with Pinyin | PinyinMe",
    description: "Print Chinese text with pinyin above the characters. A4 or Letter, color or grayscale, with the toolbar left off the page.",
    h1: "A reading handout with pinyin",
    summary: "Print Chinese with pinyin — paper, tones, and what is left off the page",
    ogImage: "/og-pinyin-for-printing.png",
    ogAlt: "PinyinMe card for printing, with 明月 míngyuè and 银行 yínháng.",
    article: printArticle,
    sample: {
      id: "sample-pinyin-for-printing",
      title: "静夜思",
      text: "床前明月光，疑是地上霜。\n举头望明月，低头思故乡。",
      settings: handout,
    },
  },
  {
    id: "hsk-pinyin",
    path: "/hsk-pinyin",
    file: "hsk-pinyin.html",
    nav: "HSK pinyin",
    title: "HSK Pinyin: Hide Readings by Level | PinyinMe",
    description: "Hide pinyin for words up to an HSK 2.0 or HSK 3.0 level you choose, and tap a word when you want the reading back.",
    h1: "Hide pinyin up to an HSK level",
    summary: "HSK pinyin — hide readings you know and keep the harder words",
    ogImage: "/og-hsk-pinyin.png",
    ogAlt: "PinyinMe card for HSK pinyin, with 银行 and 行走.",
    article: hskArticle,
    sample: {
      id: "sample-hsk-pinyin",
      title: "今天和银行",
      text: "今天天气很好。我去银行，然后看报纸上的文章。",
      settings: { hskSyllabus: "2", hskHide: 2, position: "above", toneFormat: "marks", toneColor: "pinyin" },
    },
  },
  {
    id: "traditional-chinese-pinyin",
    path: "/traditional-chinese-pinyin",
    file: "traditional-chinese-pinyin.html",
    nav: "Traditional",
    title: "Traditional Chinese to Pinyin | PinyinMe",
    description: "Add pinyin to traditional characters and switch a text between simplified and traditional. Standard characters, not a Taiwan word list.",
    h1: "Pinyin for traditional characters",
    summary: "Traditional Chinese to pinyin — readings without converting first",
    ogImage: "/og-traditional-chinese-pinyin.png",
    ogAlt: "PinyinMe card with traditional 銀行 yínháng and 行走 xíngzǒu.",
    article: traditionalArticle,
    sample: {
      id: "sample-traditional-chinese-pinyin",
      title: "圖書館和銀行",
      text: "今天天氣很好，我們去公園散步。圖書館旁邊是銀行。",
      settings: { position: "below", hskHide: 0, toneFormat: "marks", toneColor: "pinyin" },
    },
  },
  {
    id: "chinese-reader-with-dictionary",
    path: "/chinese-reader-with-dictionary",
    file: "chinese-reader-with-dictionary.html",
    nav: "Reader",
    title: "Chinese Reader with Pinyin and a Dictionary | PinyinMe",
    description: "Paste Chinese and read it with pinyin and CC-CEDICT definitions. Your texts stay in this browser. There is no account.",
    h1: "Read your own text with a dictionary",
    summary: "Chinese reader — pinyin on the words and a definition when you open one",
    ogImage: "/og-chinese-reader.png",
    ogAlt: "PinyinMe card for the reader, with 银行 yínháng and 行走 xíngzǒu.",
    article: readerArticle,
    sample: {
      id: "sample-chinese-reader",
      title: "生词和词典",
      text: "我想学中文。报纸上的文章有很多生词，阅读的时候我需要词典。",
      settings: { dictPinned: true, dictTrigger: "hover", position: "below", hskHide: 0, toneFormat: "marks", toneColor: "pinyin" },
    },
  },
];

export function pageUrl(path: string): string {
  if (path === "/") return "https://www.pinyinme.com";
  return `https://www.pinyinme.com${path}`;
}

export function landingFor(pathname: string): SitePage | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
  const page = sitePages.find((item) => item.path === path);
  if (!page?.sample) return null;
  return page;
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function pageNav(current: string): string {
  const links = sitePages.map((page) => {
    const currentAttr = page.path === current ? ' aria-current="page"' : "";
    return `<a href="${page.path}"${currentAttr}>${esc(page.nav)}</a>`;
  }).join("\n      ");
  return `<nav class="page-nav" aria-label="Pages">\n      ${links}\n    </nav>`;
}

function jsonLd(page: SitePage): string {
  const url = pageUrl(page.path);
  const image = `https://www.pinyinme.com${page.ogImage}`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.pinyinme.com/#organization",
        name: "PinyinMe",
        url: "https://www.pinyinme.com",
        logo: "https://www.pinyinme.com/icon-512.png",
      },
      {
        "@type": "WebSite",
        "@id": "https://www.pinyinme.com/#website",
        name: "PinyinMe",
        url: "https://www.pinyinme.com",
        inLanguage: "en",
        publisher: { "@id": "https://www.pinyinme.com/#organization" },
      },
      {
        "@type": "WebApplication",
        "@id": `${url}#app`,
        name: "PinyinMe",
        url,
        description: page.description,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        inLanguage: "en",
        isAccessibleForFree: true,
        featureList: [
          "Word-level pinyin above, below, or beside Chinese characters",
          "Hover and click definitions from CC-CEDICT",
          "Hide pinyin by HSK 2.0 or HSK 3.0 level",
          "Simplified and traditional Chinese conversion",
          "Printable reading handouts",
        ],
        screenshot: image,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: { "@id": "https://www.pinyinme.com/#organization" },
      },
    ],
  };
  return JSON.stringify(data, null, 2);
}

export function renderPage(page: SitePage): string {
  const url = pageUrl(page.path);
  const image = `https://www.pinyinme.com${page.ogImage}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(page.title)}</title>
    <meta name="description" content="${esc(page.description)}">
    <link rel="canonical" href="${url}">
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#f7f4ee">
    <link rel="sitemap" type="application/xml" href="/sitemap.xml">
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/manifest.webmanifest">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${esc(page.title)}">
    <meta property="og:description" content="${esc(page.description)}">
    <meta property="og:site_name" content="PinyinMe">
    <meta property="og:locale" content="en_US">
    <meta property="og:image" content="${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${esc(page.ogAlt)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${esc(page.title)}">
    <meta name="twitter:description" content="${esc(page.description)}">
    <meta name="twitter:image" content="${image}">
    <meta name="twitter:image:alt" content="${esc(page.ogAlt)}">
    <script>
      try {
        var saved = JSON.parse(localStorage.getItem("pinyinme.v1") || "null");
        var theme = saved && saved.settings && saved.settings.theme;
        if (theme !== "light" && theme !== "dark" && theme !== "sepia" && theme !== "contrast") {
          theme = localStorage.getItem("theme");
        }
        if (theme !== "light" && theme !== "dark" && theme !== "sepia" && theme !== "contrast") {
          theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        document.documentElement.dataset.theme = theme;
        var themeColor = theme === "dark" ? "#141210" : theme === "contrast" ? "#000000" : theme === "sepia" ? "#f3ead7" : "#f7f4ee";
        var themeMeta = document.querySelector('meta[name="theme-color"]');
        if (themeMeta) themeMeta.setAttribute("content", themeColor);
      } catch (e) {}
    </script>
    <script defer src="/_vercel/insights/script.js"></script>
    <script type="application/ld+json">
${jsonLd(page)}
    </script>
</head>
<body>
    <a class="skip no-print" href="#reader">Skip to reading</a>
    <main id="page" aria-label="${esc(page.h1)}">
    <div id="root"></div>
    <details class="seo no-print">
      <summary>${esc(page.summary)}</summary>
      <article class="seo-body">
        <h1 id="page-title">${esc(page.h1)}</h1>
        ${page.article.trim()}
        <h2>More on PinyinMe</h2>
        ${pageNav(page.path)}
      </article>
    </details>
    </main>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>
`;
}

export function render404(): string {
  const links = sitePages.map((page) => `    <li><a href="${page.path}">${esc(page.nav)}</a></li>`).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page not found | PinyinMe</title>
  <meta name="robots" content="noindex">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <style>
    :root { color-scheme: light; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #f7f4ee;
      color: #1d1a16;
      font-family: system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.5;
    }
    main { max-width: 36rem; padding: 32px 24px; }
    .mark { margin: 0 0 12px; color: #9c2f1c; font-family: Georgia, "Iowan Old Style", Palatino, serif; font-size: 28px; }
    h1 { font-size: 2rem; line-height: 1.15; letter-spacing: -0.03em; margin: 0 0 12px; }
    p { margin: 0 0 16px; }
    ul { padding-left: 1.2rem; }
    a { color: #9c2f1c; }
  </style>
</head>
<body>
  <main>
    <p class="mark">ā PinyinMe</p>
    <h1>Page not found</h1>
    <p>That address isn’t a page on PinyinMe. The converter and the guides are here:</p>
    <ul>
${links}
    </ul>
  </main>
</body>
</html>
`;
}

export function articleWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ");
  return text.split(/\s+/).filter((word) => /[A-Za-z]/.test(word)).length;
}
