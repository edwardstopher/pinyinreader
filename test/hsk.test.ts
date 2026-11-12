import { describe, expect, it } from "vitest";
import { maskedByLevel, showPinyin } from "../src/pipeline/hsk";
import type { WordToken } from "../src/pipeline/types";

function word(patch: Partial<WordToken>): WordToken {
  return {
    kind: "word",
    text: "学习",
    start: 0,
    end: 2,
    slots: [],
    hsk2: 1,
    hsk3: 1,
    freq: 789,
    lowConfidence: false,
    corrected: false,
    entryIds: [],
    chosenEntry: null,
    sentence: 0,
    ...patch,
  };
}

const base = { hskHide: 0, syllabus: "2" as const, freqHide: 0, positionHidden: false };

describe("selective pinyin", () => {
  it("hides words at or below the chosen HSK level and reveals them on tap", () => {
    const easy = word({ hsk2: 1, freq: 789 });
    const harder = word({ text: "银行", hsk2: 3, freq: 769, start: 2 });
    const settings = { ...base, hskHide: 1 };
    expect(maskedByLevel(easy, settings)).toBe(true);
    expect(showPinyin(easy, settings, [])).toBe(false);
    expect(showPinyin(easy, settings, [{ offset: 0, text: "学习" }])).toBe(true);
    expect(showPinyin(harder, settings, [])).toBe(true);
  });

  it("uses the selected syllabus and leaves unlisted words visible", () => {
    const onlyNew = word({ text: "一点儿", hsk2: null, hsk3: 1 });
    expect(showPinyin(onlyNew, { ...base, hskHide: 1, syllabus: "2" }, [])).toBe(true);
    expect(showPinyin(onlyNew, { ...base, hskHide: 1, syllabus: "3" }, [])).toBe(false);
    const unknown = word({ text: "龘", hsk2: null, hsk3: null, freq: null });
    expect(showPinyin(unknown, { ...base, hskHide: 6, syllabus: "2" }, [])).toBe(true);
  });

  it("also hides the top of the frequency list, and a hidden position wins over reveal", () => {
    const common = word({ text: "的", hsk2: 1, freq: 1 });
    expect(showPinyin(common, { ...base, freqHide: 10 }, [])).toBe(false);
    expect(showPinyin(common, { ...base, freqHide: 10 }, [{ offset: 0, text: "的" }])).toBe(true);
    expect(showPinyin(common, { ...base, positionHidden: true }, [{ offset: 0, text: "的" }])).toBe(false);
  });
});
