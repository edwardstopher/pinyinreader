import { describe, expect, it } from "vitest";
import { parseDict } from "../src/dict/parse";
import { describeToken } from "../src/dict/readings";
import type { WordToken } from "../src/pipeline/types";

function token(text: string, ids: number[]): WordToken {
  return {
    kind: "word",
    text,
    start: 0,
    end: text.length,
    slots: [...text].map((ch) => ({ ch, syl: null })),
    hsk2: null,
    hsk3: null,
    freq: null,
    lowConfidence: false,
    corrected: false,
    entryIds: ids,
    chosenEntry: ids[0] ?? null,
    sentence: 0,
  };
}

const dict = parseDict([
  "# version test",
  "银行\t銀行\tyin2 hang2\t3\t3\t769\t家[jia1]\tbank",
  "行\t行\thang2\t4\t3\t272\t\trow; line",
  "行\t行\txing2\t4\t3\t272\t\tto walk",
].join("\n"));

describe("describeToken", () => {
  it("returns the dictionary senses once the dictionary is available", () => {
    const view = describeToken(token("银行", [0]), dict);
    expect(view.ready).toBe(true);
    expect(view.blocks[0]?.senses).toEqual(["bank"]);
    expect(view.blocks[0]?.pinyinLabel).toBe("yínháng");
    expect(view.blocks[0]?.classifiers).toEqual(["家[jia1]"]);
    expect(view.characters.map((item) => item.ch)).toEqual(["银", "行"]);
  });

  it("lists both readings of 行", () => {
    const view = describeToken(token("行", [1, 2]), dict);
    expect(view.readings.map((item) => item.label)).toEqual(expect.arrayContaining(["háng", "xíng"]));
    expect(view.blocks).toHaveLength(2);
  });

  it("stays not-ready before the dictionary has been parsed", () => {
    const view = describeToken(token("银行", []), null);
    expect(view.ready).toBe(false);
    expect(view.blocks).toEqual([]);
  });
});
