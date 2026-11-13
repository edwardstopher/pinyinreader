export const homeArticle = `
<p class="lede">PinyinMe is a Chinese to pinyin converter for self-study. Paste or type characters and each word keeps its own reading, with tone marks, instead of one long line of syllables under a paragraph. Click a word for a short English definition. Hide the pinyin you already know, switch between simplified and traditional, and print a handout. It is free. Your texts stay in this browser, and there is no account.</p>
<h2>How to convert Chinese to pinyin</h2>
<ol>
  <li>Open Text and paste or type Chinese, or start from one of the samples. Shift+Enter, or Annotate with Pinyin, closes the editor and leaves the reading view.</li>
  <li>Choose where the reading sits: above the characters, below them, inline, or hidden. Choose tone marks, tone numbers, or no tones.</li>
  <li>Click a word to open the definition, the HSK level when one is listed, and any other readings. In Style you can switch that from click to hover. Print uses the browser’s print dialog, including Save as PDF.</li>
</ol>
<h2>What you can do</h2>
<ul>
  <li>Word-level readings. Spaces, line breaks, and text that is not Chinese stay where you put them. A long text is drawn in sections so a chapter does not lock the page.</li>
  <li>Definitions from <a href="https://www.mdbg.net/chinese/dictionary?page=cc-cedict">CC-CEDICT</a>, including measure words. This copy is the 12 November 2026 release, with HSK levels and frequency ranks added. The dictionary data stays under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. About names the sources.</li>
  <li>HSK-level pinyin. Hide readings at or below a level you pick, on the HSK 2.0 lists (1–6) or the HSK 3.0 lists (1–7, where band 7 covers levels 7–9). A word with no listed level stays visible. You can also hide the most frequent words. Tap a hidden word to show its reading again.</li>
  <li>Simplified and traditional. The 简 and 繁 buttons rewrite the open text at word level. This is standard character conversion, not a separate Taiwan vocabulary list.</li>
  <li>A correction when a reading is wrong for the sentence: change that one occurrence, or every time the word appears.</li>
  <li>Listening, with a Chinese voice installed in the browser. Play the passage, a sentence, or a word. If this device has no Chinese voice, playback stays unavailable.</li>
  <li>A library on this device. Save more than one text, import a .txt or .md file, and come back to the last reading position.</li>
  <li>Print on A4 or US Letter, portrait or landscape, with margins, and with tone colors, grayscale, or underline patterns. The toolbar and this guide are left off the page.</li>
</ul>
<p>PinyinMe does not make handwriting worksheets, and it does not add Zhuyin. Tone sandhi for 一 and 不 is left off, so you see the citation tone.</p>
<h2>A word with more than one reading</h2>
<p class="example"><ruby lang="zh-Hans">银行<rt lang="zh-Latn">yínháng</rt></ruby> is “bank”. <ruby lang="zh-Hans">行走<rt lang="zh-Latn">xíngzǒu</rt></ruby> is “to walk”. The character 行 is háng in the first word and xíng in the second.</p>
<p>A converter that paints one reading onto every 行 will miss one of those words. PinyinMe looks the word up. When the word itself has more than one reading, the dictionary lists the others and you can choose. The sample text on the desk includes 银行.</p>
<h2>Questions</h2>
<h3>Does this work offline?</h3>
<p>Readings are produced in the browser, so they still show without a connection. Definitions come from a dictionary file that is saved on the device after the first download. After that, lookups work offline. The first visit needs a connection to fetch the dictionary.</p>
<h3>Is there an account?</h3>
<p>No. Texts, corrections, and settings are stored in this browser only. Clearing the site’s data removes them. There is no server copy of your texts.</p>
<h3>Which HSK list does the filter use?</h3>
<p>You choose HSK 2.0 or HSK 3.0 in Style. The levels come from the complete-hsk-vocabulary compilation: the older six-level lists, and the 2026 bands, where band 7 covers levels 7–9. Frequency ranks in that compilation trace back to a BCC/BLCU list. They are a way to hide common words, not an exam score.</p>
<h3>Can I print only some of the pinyin?</h3>
<p>Yes. Set “Hide pinyin up to” before you print. Words you have not revealed stay quiet on the page. Choosing a hidden position in Style turns readings off. In the browser’s print dialog, turn off its own headers and footers if you do not want its page-number line.</p>
<h3>Why is a reading different from my textbook?</h3>
<p>Some characters have several readings, and a name or a rare word may be missing from the dictionary. Open the word and pick another reading. A single character that the dictionary does not list still gets a reading from the pinyin library. 一 and 不 keep their citation tones, without the sandhi a textbook sometimes shows in running speech.</p>
<h3>Can I reuse the dictionary?</h3>
<p>The definitions are CC-CEDICT, licensed CC BY-SA 4.0. PinyinMe is a reading tool. Reusing the dictionary data means keeping that license. About names the exact release and the HSK source.</p>
`;

export const converterArticle = `
<p class="lede">This page is a Chinese to pinyin converter for a text you already have. Paste the characters and each word gets its own reading, with tone marks, sitting on that word. It is not one long string of syllables dropped under a whole paragraph. You can look a word up, hide readings you know, and print the page. It is free, it runs in the browser, and there is no account.</p>
<p>The tool above opens on a short sample that puts two readings of 行 next to each other. Use it as a test, or replace it with your own text from the Text button. Nothing you paste is uploaded. The library, if you save more than one text, stays in this browser.</p>
<h2>How to convert a text</h2>
<ol>
  <li>Open Text, paste or type Chinese, and press Annotate with Pinyin. Shift+Enter does the same thing and closes the editor.</li>
  <li>Set the reading above the characters, below them, or inline. Tone marks are the default. Tone numbers, or no tones at all, are in Style.</li>
  <li>Click a word for the English gloss, the HSK level when the list has one, and any other reading. Switch that click to a hover in Style if you prefer.</li>
</ol>
<h2>Why the reading is attached to the word</h2>
<p>A line of pinyin under a paragraph is hard to line up once the line wraps. PinyinMe segments the characters into words with the CC-CEDICT word list, then places the reading on that word. Spaces, line breaks, and any text that is not Chinese stay where you put them. A long passage is drawn in sections, so a chapter does not freeze the page while it is annotated.</p>
<p>The reading comes from the dictionary when the word is listed, and from the pinyin library otherwise. Tone sandhi for 一 and 不 is left off. If a sentence needs another reading, open the word and pick one for that spot or for the whole text.</p>
<h2>What this converter is for</h2>
<ul>
  <li>Self-study on a text you chose: a message, a paragraph from a book, or something you wrote.</li>
  <li>Checking a word you cannot read yet, without sending the text to an account.</li>
  <li>Seeing HSK 2.0 or HSK 3.0 level on a word that is on those lists, and hiding pinyin up to a level. That control is explained on the <a href="/hsk-pinyin">HSK pinyin</a> page.</li>
  <li>Switching the open text between simplified and traditional. See <a href="/traditional-chinese-pinyin">traditional Chinese to pinyin</a>.</li>
  <li>Printing a page with the readings kept on the words. See <a href="/pinyin-for-printing">print with pinyin</a>.</li>
</ul>
<p>It does not make handwriting practice sheets, and it does not add Zhuyin. Definitions are short glosses from CC-CEDICT, the 12 November 2026 release, not a graded course. Listening uses a Chinese voice installed in your browser. If the device has none, playback stays unavailable.</p>
<h2>Example: one character, two words</h2>
<p class="example"><ruby lang="zh-Hans">银行<rt lang="zh-Latn">yínháng</rt></ruby> is “bank”. <ruby lang="zh-Hans">行走<rt lang="zh-Latn">xíngzǒu</rt></ruby> is “to walk”. 行 is háng in the first word and xíng in the second.</p>
<p>The sample on this page includes both words. A converter that copies a single reading of 行 onto every occurrence will get one of them wrong. PinyinMe looks up the word. When that word still has more than one reading, the dictionary lists the others and you choose. The same character in a name or a rare word may be missing. A single character that is not listed still gets a reading from the pinyin library, and you can replace it.</p>
<h2>Questions</h2>
<h3>Does it remember my text?</h3>
<p>Only in this browser. Save it in the library if you want it next time on this device. Clearing site data removes it. There is no login and no server copy.</p>
<h3>Will the tones match my teacher?</h3>
<p>Often, and not always. Citation tones are used for 一 and 不. Some words have more than one accepted reading. Open the word and pick the one this sentence needs.</p>
<h3>Where do the definitions come from?</h3>
<p>CC-CEDICT, used under CC BY-SA 4.0. The reader page explains how the dictionary opens: <a href="/chinese-reader-with-dictionary">Chinese reader with a dictionary</a>.</p>
`;

export const printArticle = `
<p class="lede">This page turns Chinese you paste into a reading handout: characters with pinyin on the same word, ready for paper or a PDF. It is not a handwriting worksheet. There are no empty boxes to trace strokes. The point is a page you can read, or hand to someone, with the pronunciation sitting on the words.</p>
<p>The sample above is the poem 静夜思, already set in a print-like style: pinyin above the characters, a song-style Chinese font when your device has one, and tone color turned off so the page stays quiet in black and white. Open Text if you want a different passage. Your text replaces the sample in this browser only.</p>
<h2>How to print</h2>
<ol>
  <li>Paste the text and check the readings. Fix any word that is wrong for the sentence before you print.</li>
  <li>Choose Print in the toolbar. The browser’s own dialog opens, including Save as PDF. Set “Hide pinyin up to” first if you want familiar words left quiet on the paper.</li>
  <li>In that dialog, turn off the browser’s headers and footers if you do not want its URL and page number on the sheet.</li>
</ol>
<h2>What the page includes</h2>
<p>Style, and the print section inside it, covers A4 or US Letter, portrait or landscape, and the margin in millimetres. Tones on paper can stay in color, drop to grayscale, or become underline patterns: solid, dotted, dashed, and wavy for the four tones, with no underline on the neutral tone. A small legend is included when patterns are on. The toolbar, this guide, and the buttons are left off the page. Only the reading text is printed.</p>
<p>Pinyin stays with its word when a line wraps. You can raise the minimum pinyin size for paper. This page selects the Print handout preset for the print dialog and uses a similar quiet layout on screen.</p>
<h2>A handout, not a practice sheet</h2>
<p>Pages that rank for “print Chinese with pinyin” are often stroke-practice grids. Those are useful for learning to write a character. They are a different job. PinyinMe is for reading. A learner who wants a page of a story, a song, or a poem, with readings they can follow, does not need empty boxes. If you also want to hide the pinyin on words below a level, set that before printing. Words you have tapped open stay visible. Words you have not revealed stay quiet. The <a href="/hsk-pinyin">HSK pinyin</a> page describes that filter.</p>
<p>Simplified or traditional is whatever the text is when you press Print. The 简 and 繁 buttons rewrite the open text first if you need the other set. That conversion is described on the <a href="/traditional-chinese-pinyin">traditional Chinese</a> page.</p>
<h2>Example</h2>
<p class="example"><ruby lang="zh-Hans">明月<rt lang="zh-Latn">míngyuè</rt></ruby> in the sample is “bright moon”. The line is from 静夜思, which is in the public domain. The tool adds the readings. It does not ship a library of poems.</p>
<p>Print the sample once before you trust a longer text. Check that the tone marks survived, that a wrapped line still keeps pinyin with its word, and that the browser did not add a header you did not want. Then paste the passage you actually need.</p>
<h2>Questions</h2>
<h3>Can I print only the words I struggle with?</h3>
<p>Set “Hide pinyin up to” an HSK level, or hide the most frequent words, then print. There is no way to tick individual words for the page other than revealing or hiding them in the reading view.</p>
<h3>Does color print?</h3>
<p>If you leave tones in color and the printer or the PDF viewer keeps color, the tone colors print. Grayscale and the underline patterns are there for a black-and-white sheet.</p>
<h3>Will the guide and the buttons appear?</h3>
<p>No. They are marked to drop out of print, along with the dictionary panel. If you still see a URL, it is the browser’s header. Turn that off in the print dialog.</p>
<h3>Can I save the layout?</h3>
<p>Style lets you save a named preset and export it. The built-in Print handout preset is the one this page selects for the print dialog. Your presets stay in this browser.</p>
<h3>Is this a worksheet generator?</h3>
<p>No. There are no stroke-order diagrams and no blank grids. It prints the reading text you pasted.</p>
`;

export const hskArticle = `
<p class="lede">HSK pinyin here means a filter, not a course. You choose a level, and readings at or below that level drop away. Harder words keep their pinyin. Tap a hidden word when you want it back. The lists are HSK 2.0, with six levels, or HSK 3.0, the 2026 bands, where band 7 covers levels 7–9. This page opens with HSK 2.0 and “hide up to HSK 2” already set, on a short sample.</p>
<p>The sample is 今天天气很好。我去银行，然后看报纸上的文章。 On the HSK 2.0 lists, 今天, 天气, 我, 去, 看, and 报纸 are level 1 or 2, so their readings start hidden. 银行 is level 3 and 文章 is level 4, so those readings stay. 然后 is level 3 and stays as well. A word with no HSK 2.0 level is never hidden by this control. That is a property of the list, not a judgement that the word is easy.</p>
<h2>How to use the filter</h2>
<ol>
  <li>Pick HSK 2.0 or HSK 3.0 in Style. The toolbar’s “Hide pinyin up to” follows the list you picked. HSK 3.0 stops at band 7.</li>
  <li>Choose a level. “Show all” turns the filter off. A level hides words at that level and below, and leaves higher words, and unlisted words, visible.</li>
  <li>Tap a hidden word to reveal that one spot. Hide it again from the dictionary panel if you want the reading gone.</li>
</ol>
<h2>What the levels are, and what they are not</h2>
<p>The levels come from the complete-hsk-vocabulary compilation. HSK 2.0 follows the older six-level lists. HSK 3.0 follows the newest bands in that compilation. Frequency ranks in the same compilation trace back to a BCC/BLCU list. You can also hide the most frequent words, separate from HSK, using the frequency control in Style. None of this is an official score, and it will not match every textbook’s private list.</p>
<p>Switching list changes which number is attached to a word. 中文 is HSK 4 on the 2.0 list and HSK 1 on the 3.0 list in this data. If a word suddenly shows or hides after you change syllabus, that is the list changing, not the tool forgetting your setting. The number on the word, when you open it, is the level for the syllabus currently selected.</p>
<h2>Reading without leaning on every reading</h2>
<p>The useful case is a text that is a little hard. Hiding the band you believe you know leaves a trail on the words you do not. If a hidden word was not actually known, one tap shows it. The <a href="/chinese-to-pinyin">Chinese to pinyin</a> page is the general converter, if you want every reading on first.</p>
<p>You can print in this state. Hidden words stay quiet on the paper unless you revealed them. The <a href="/pinyin-for-printing">print page</a> describes the sheet itself. The filter does not remove the characters, and it does not rewrite the text into a graded reader. It only decides which readings are drawn.</p>
<h2>Example</h2>
<p class="example">With hide-up-to-HSK-2 on the 2.0 list, <ruby lang="zh-Hans">银行<rt lang="zh-Latn">yínháng</rt></ruby> keeps its reading (HSK 3) and <ruby lang="zh-Hans">今天<rt lang="zh-Latn">jīntiān</rt></ruby> starts hidden (HSK 1).</p>
<p>Open the sample and look at the toolbar. It should already say HSK 2, not “Show all”. Change it to Show all and the quiet words come back. Put it back and they go quiet again, except any word you revealed by tapping. Reveals are stored with the text, in this browser.</p>
<h2>Questions</h2>
<h3>Which list should I pick?</h3>
<p>Use 2.0 if your book or class still quotes the six levels. Use 3.0 if you are following the newer bands. You can switch. The tool does not mix the two numbering systems on one word.</p>
<h3>Why did an easy word keep its pinyin?</h3>
<p>It is not on the list you selected, or its level is above the cutoff. 汉字, for example, has an HSK 3.0 level in this data and no HSK 2.0 level, so the 2.0 filter will not hide it.</p>
<h3>Does hiding pinyin hide the definition?</h3>
<p>No. Click or tap the word and the dictionary still opens. The filter only affects the reading drawn on the text.</p>
<h3>Can I hide by frequency instead?</h3>
<p>Yes, in Style. A frequency cutoff hides common words by rank. It is separate from the HSK control, and both can be on at once.</p>
<h3>Is this an HSK exam?</h3>
<p>No. There are no questions, no score, and no account. It is a display filter for texts you supply.</p>
`;

export const traditionalArticle = `
<p class="lede">Traditional characters can take pinyin the same way simplified ones do. This page opens on a short traditional sample, so the readings you see first are for the characters as written, not for a simplified copy. The 简 and 繁 buttons can still rewrite the open text if you want the other set. Conversion is word by word. It is standard character mapping, not a separate Taiwan vocabulary list.</p>
<p>The sample is 今天天氣很好，我們去公園散步。圖書館旁邊是銀行。 我們 and 書 are enough for the script control to treat the text as traditional. 銀行 is the traditional form of 银行, and the reading is still yínháng. You do not have to convert to simplified before the pinyin appears.</p>
<h2>How to get pinyin on traditional text</h2>
<ol>
  <li>Paste traditional characters into Text. The reading view keeps those characters and adds pinyin to the words.</li>
  <li>If the toggle shows 繁 pressed, the tool has detected traditional characters in the passage. You can leave it. Press 简 only if you want the text rewritten into simplified.</li>
  <li>Click a word for the definition and any other reading, the same way as on a simplified text.</li>
</ol>
<h2>What the conversion does</h2>
<p>The converter is OpenCC, set for standard traditional, not Taiwan vocabulary. A simplified word such as 软件 becomes 軟件, not the Taiwan term 軟體. Place names and everyday words can still differ from the wording a teacher in Taipei would choose. The tool changes characters. It does not translate between regional word choices, and it does not add Zhuyin.</p>
<p>Going the other way, 繁 to 简, uses the matching simplified mapping. The open text is replaced. A correction you made is carried across when the characters of that word can be converted. If the length of the text changes in a way that breaks saved positions, reveals are dropped so a highlight does not stick to the wrong characters. Readings are then calculated again for the new text.</p>
<h2>Who this is for</h2>
<p>Learners using traditional textbooks, or reading something from Taiwan or Hong Kong, often meet a converter that assumes simplified input. Pasting traditional text here should not require a preprocessing step. Segmentation uses the dictionary’s traditional forms as well as the simplified ones, so a word written as 圖書館 can be found as a word. A rare character that is in neither form still gets a per-character reading from the pinyin library.</p>
<p>The same limits apply as on the <a href="/chinese-to-pinyin">Chinese to pinyin</a> page. Citation tones are used for 一 and 不. A word with several readings lists them when you open it. You can hide pinyin by HSK level. The level lists are the same data as on the <a href="/hsk-pinyin">HSK pinyin</a> page. They are not a separate traditional syllabus.</p>
<h2>Example</h2>
<p class="example"><ruby lang="zh-Hant">銀行<rt lang="zh-Latn">yínháng</rt></ruby> is “bank”. <ruby lang="zh-Hans">行走<rt lang="zh-Latn">xíngzǒu</rt></ruby> is “to walk”, and those two characters are the same in both scripts. 行 is háng in 銀行 and xíng in 行走.</p>
<p>The sample includes 銀行. Open it and the gloss should be the same bank entry you would get from 银行, because they are one dictionary record with two written forms. If a traditional-only word is missing, you will see the reading from the pinyin library and no CC-CEDICT gloss. That is an honest gap in the word list, not a failed conversion.</p>
<h2>Questions</h2>
<h3>Will this produce Taiwanese wording?</h3>
<p>No. 软件 becomes 軟件, not 軟體. If you need regional vocabulary, edit the words yourself. The buttons only convert characters.</p>
<h3>Can I start from simplified and get traditional?</h3>
<p>Yes. Paste simplified text and press 繁. Check the result. Word-level conversion is usually what you want, and it can still be wrong on a name or an ambiguous word.</p>
<h3>Does traditional text get different pinyin?</h3>
<p>The reading follows the word, not the script. 銀行 and 银行 share yínháng. A different word, even if it uses a related character, can have a different reading, as 行走 does.</p>
<h3>Is Zhuyin included?</h3>
<p>No. The readings are Hanyu Pinyin, with tone marks, tone numbers, or no tones. There is no bopomofo track.</p>
<h3>Where is the text stored?</h3>
<p>In this browser, if you keep it in the library. There is no account. Clearing site data removes it.</p>
`;

export const readerArticle = `
<p class="lede">This is a Chinese reader for text you bring yourself. Paste a passage, get word-level pinyin, and open a short English definition when you need it. There is no feed of articles, no account, and no progress score. The sample above is only a starting point: a few lines with words worth opening, including 生词 and 词典. Replace it with the page, chat, or chapter you actually want to read.</p>
<p>Definitions come from CC-CEDICT, the 12 November 2026 release, with HSK levels and frequency ranks added on top. The dictionary data stays under CC BY-SA 4.0. On a wide screen the definition sits in a side panel. On a narrow screen it opens as a sheet. This page sets the trigger to hover on a device that can hover, and a tap still works. Phones use the tap. Style can switch the trigger back to click only.</p>
<h2>How to read a text</h2>
<ol>
  <li>Open Text and paste. Annotate with Pinyin, or press Shift+Enter, to close the editor and stay in the reading view.</li>
  <li>Move through the words with the mouse or with the arrow keys. Enter or a click opens the definition. On a phone, tap the word and the sheet opens.</li>
  <li>Save the text in the library if you want it later on this device. Import a .txt or .md file if the passage is already a file.</li>
</ol>
<h2>What you see when a word opens</h2>
<p>The panel shows the word, the other script when simplified and traditional differ, the reading, and the HSK level for the syllabus you selected. If the word is on a frequency list, the rank is there too. A lower rank is more frequent. Senses are the CC-CEDICT glosses, and measure words are listed when the entry has them. Other readings are buttons. Choose one for this occurrence, or tick the box to apply it every time that word appears in the text.</p>
<p>If the dictionary is still loading, the panel says so. Readings are already on the text. After the first download, the file stays in this browser, so later lookups work offline. The first visit needs a connection. A word with no entry still has a reading, and the panel says the gloss is missing.</p>
<h2>What this reader is not</h2>
<p>It is not a course, and it does not choose your next text or track what you have read. You bring the paragraph. The tool annotates it in this browser and forgets it if you clear site data.</p>
<p>You can hide pinyin up to an HSK level while you read, which is the idea on the <a href="/hsk-pinyin">HSK pinyin</a> page. You can print the passage, which is the idea on the <a href="/pinyin-for-printing">print page</a>. You can switch script, which is the idea on the <a href="/traditional-chinese-pinyin">traditional</a> page. Listening uses a Chinese voice from the browser. If none is installed, the play buttons stay unavailable. There is no Zhuyin and no handwriting practice.</p>
<h2>Example</h2>
<p class="example">Open <ruby lang="zh-Hans">生词<rt lang="zh-Latn">shēngcí</rt></ruby> in the sample. The gloss is a new or unfamiliar word. <ruby lang="zh-Hans">词典<rt lang="zh-Latn">cídiǎn</rt></ruby> is “dictionary”. The reading is on the word either way. The gloss appears when the dictionary has loaded and you open the word.</p>
<p>If the side panel says the dictionary is still loading, wait a moment and open the word again. The status line in the toolbar moves from a download message to “Dictionary ready”. After that, the same word should show its senses without another download.</p>
<h2>Questions</h2>
<h3>Does hover work on a phone?</h3>
<p>No. A phone opens the dictionary when you tap. Hover is for a fine pointer.</p>
<h3>Are the definitions edited for learners?</h3>
<p>They are CC-CEDICT glosses, plus the HSK and frequency fields added in this copy. They are short, and they can be technical. They are not rewritten as a textbook.</p>
<h3>Can someone else open my text?</h3>
<p>Not from PinyinMe. There is no share link and no account. The text is on your device. A shareable link would be a later feature, and it is not in this version.</p>
<h3>What if I disagree with a reading?</h3>
<p>Open the word and choose another one. You can apply it once or everywhere that word appears in this text. You cannot invent a spelling the dictionary and the pinyin library do not list.</p>
`;
