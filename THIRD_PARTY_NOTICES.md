# Third-party notices

PinyinMe keeps dictionary data under its own open license. The application code is separate.

## CC-CEDICT

Definitions, readings and measure words come from CC-CEDICT, published by MDBG.

- License: Creative Commons Attribution-ShareAlike 4.0 International
- https://creativecommons.org/licenses/by-sa/4.0/
- https://www.mdbg.net/chinese/dictionary?page=cc-cedict
- Release used: 2026-11-12, 125,408 entries
- Referenced work: CEDICT, copyright 1997, 1998 Paul Andrew Denisowski

`public/dict/cedict.txt.gz` is a derivative. Entries were repacked and HSK levels and frequency ranks were added. That file stays under CC BY-SA 4.0. Attribution also appears in the app (About, and on each definition).

## HSK levels and frequency

Joined from [complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary) by Yanis Zafirópulos.

- License: MIT
- Commit: `7ac65bf1a6387d35f1ade478906172a19311c7f9`
- HSK 2.0: the project's `old-*` levels (the previous six-level lists, ultimately the HSK 2.0 syllabus)
- HSK 3.0: the project's `newest-*` levels, the 2026 syllabus. Band 7 includes levels 7–9
- Frequency ranks: the ranks published in that compilation, tracing to the BCC/BLCU corpus list circulated with Pleco

Only the level, frequency, simplified form, traditional form and numeric pinyin were taken from this list. Definitions in the app come from CC-CEDICT, not from this file.

## pinyin-pro

Contextual character readings and the list of alternate pronunciations.

- Package: `pinyin-pro` 3.29.5
- License: MIT
- https://github.com/zh-lx/pinyin-pro
- Copyright 2022-present zh-lx

Tone sandhi for 一 and 不 is turned off. Citation tones are shown. Word readings prefer CC-CEDICT when a word matches.

## OpenCC / opencc-js

Word-level simplified and traditional conversion.

- Package: `opencc-js` 1.4.2
- Code license: MIT (https://github.com/nk2028/opencc-js)
- Bundled dictionary data: Apache License 2.0, derived from `opencc-data` / OpenCC
- Conversion used: `cn` ↔ `t` (standard traditional, not Taiwan vocabulary substitution)

## idb

IndexedDB helper for saved texts and the dictionary cache.

- Package: `idb` 8
- License: ISC
- https://github.com/jakearchibald/idb

## React

- Packages: `react`, `react-dom`
- License: MIT
