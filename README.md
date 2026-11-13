# PinyinMe

A browser reading desk for Chinese. Paste a text, read it with word-level pinyin, look words up, listen, and print a clean handout. Texts and settings stay in this browser. There is no account and no backend.

Live site: [www.pinyinme.com](https://www.pinyinme.com)

## Develop

Node.js 26 (`engines.node` is `26.x`, which is what Vercel uses for the build).

```bash
npm install
npm test
npm run dev
npm run build
```

`npm run build` typechecks, then produces a static `dist/` for Vercel. The dictionary is already in `public/dict/` and is copied into the build. Rebuild it with `npm run dict:build` (it downloads CC-CEDICT and the HSK list if they are not cached under `data/raw/`).

## What v1 does

- Live annotation as you type or paste, including Shift+Enter and the Annotate button
- Paragraphs, spaces and non-Chinese text kept as plain text
- Long texts rendered in chunks
- A local library (title, source, last opened, reading position)
- Import `.txt` and `.md`
- Word segmentation from CC-CEDICT, with a per-character mode
- Polyphones, neutral tone and erhua from the dictionary, with a correction for one occurrence or the whole text
- Rare characters, including those outside the basic multilingual plane, kept whole
- Pinyin above, below, inline or hidden; tone marks, numbers or none; tone colors including a colorblind-safe set
- Fonts, size, spacing, line width, light / dark / sepia / high contrast
- Named presets, import and export
- Hide pinyin at or below an HSK level, and optionally for the most frequent words. Tap a word to reveal it
- CC-CEDICT definitions in a popover or a side panel (a bottom sheet on a phone)
- Word and sentence audio via the browser’s Chinese voices
- Simplified / traditional conversion with OpenCC
- Print stylesheet: paper size, margins, pinyin kept with its word, grayscale or patterned tones. Save as PDF is the browser’s print dialog

## Data and licenses

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [public/dict/LICENSE.txt](public/dict/LICENSE.txt).

- CC-CEDICT, CC BY-SA 4.0, is the dictionary. The data stays under that license.
- HSK 2.0 / HSK 3.0 (2026) levels and frequency ranks are from complete-hsk-vocabulary (MIT).
- pinyin-pro (MIT) supplies contextual single-character readings.
- opencc-js (MIT; OpenCC data Apache-2.0) converts between simplified and traditional.

Ads are not implemented. `.ad-region` is a hidden slot for a later placement, and it is removed in print.
