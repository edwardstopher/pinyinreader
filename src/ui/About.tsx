export function About({ onClose }: { onClose: () => void }) {
  return (
    <div className="about">
      <div className="drawer-bar">
        <h2>About PinyinMe</h2>
        <button type="button" onClick={onClose} aria-label="Close about">Close</button>
      </div>
      <p>PinyinMe is a reading desk for Chinese. Paste a text, read it with word-level pinyin, look words up, and print a clean handout. Everything stays in this browser. There is no account.</p>
      <h3>Dictionary</h3>
      <p>
        Definitions, pinyin and measure words are from <a href="https://www.mdbg.net/chinese/dictionary?page=cc-cedict">CC-CEDICT</a>,
        published by MDBG and licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.
        The copy used here is the 12 November 2026 release. It is a derivative: HSK levels and frequency ranks were added, and the file was repacked. The dictionary data stays under CC BY-SA 4.0. See <code>public/dict/LICENSE.txt</code>.
      </p>
      <h3>HSK and frequency</h3>
      <p>
        HSK 2.0 and HSK 3.0 (2026 syllabus) levels, and the frequency ranks used to hide common words, come from{" "}
        <a href="https://github.com/drkameleon/complete-hsk-vocabulary">complete-hsk-vocabulary</a> by Yanis Zafirópulos (MIT),
        commit 7ac65bf. HSK 2.0 follows the older six-level lists. HSK 3.0 follows the <code>newest</code> bands in that compilation, where band 7 includes levels 7–9.
        Frequency ranks in that project trace back to the BCC/BLCU corpus list circulated with Pleco.
      </p>
      <h3>Software</h3>
      <ul>
        <li><a href="https://github.com/zh-lx/pinyin-pro">pinyin-pro</a> (MIT) for contextual readings and alternate pronunciations. Tone sandhi for 一 and 不 is left off, matching textbook citation tones.</li>
        <li><a href="https://github.com/nk2028/opencc-js">opencc-js</a> (MIT; dictionary data Apache-2.0) for word-level simplified and traditional conversion.</li>
        <li>Speech uses the browser’s own Chinese voices. If this device has none, playback is unavailable.</li>
      </ul>
      <p>Full notices are in <code>THIRD_PARTY_NOTICES.md</code> in the project repository.</p>
    </div>
  );
}
