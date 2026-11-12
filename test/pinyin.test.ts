import { describe, expect, it } from "vitest";
import { alignReading, formatSyl, joinReading, parseSyllableToken } from "../src/pipeline/pinyin";
import type { Slot } from "../src/pipeline/types";

function slots(numeric: string, chars: string): Slot[] {
  const aligned = alignReading([...chars], numeric);
  if (!aligned) throw new Error(`could not align ${numeric} to ${chars}`);
  return aligned;
}

describe("pinyin formatting", () => {
  it("places tone marks on the correct vowel", () => {
    expect(formatSyl({ base: "xue", tone: 2, erhua: false }, "marks")).toBe("xué");
    expect(formatSyl({ base: "nv".replace("v", "ü"), tone: 3, erhua: false }, "marks")).toBe("nǚ");
    expect(formatSyl({ base: "lüe", tone: 4, erhua: false }, "marks")).toBe("lüè");
    expect(formatSyl({ base: "liu", tone: 2, erhua: false }, "marks")).toBe("liú");
    expect(formatSyl({ base: "dui", tone: 4, erhua: false }, "marks")).toBe("duì");
    expect(formatSyl({ base: "gou", tone: 3, erhua: false }, "marks")).toBe("gǒu");
  });

  it("treats tone 0 and tone 5 as the neutral tone", () => {
    expect(parseSyllableToken("de0")?.tone).toBe(5);
    expect(parseSyllableToken("men5")?.tone).toBe(5);
    expect(formatSyl({ base: "de", tone: 5, erhua: false }, "marks")).toBe("de");
    expect(formatSyl({ base: "men", tone: 5, erhua: false }, "numbers")).toBe("men5");
    expect(formatSyl({ base: "fa", tone: 5, erhua: false }, "none")).toBe("fa");
  });

  it("reads ü from CEDICT u: and v spellings", () => {
    expect(parseSyllableToken("nu:3")?.base).toBe("nü");
    expect(parseSyllableToken("nv3")?.base).toBe("nü");
    expect(parseSyllableToken("lü4")?.base).toBe("lü");
  });

  it("joins word pinyin, with an apostrophe and erhua", () => {
    expect(joinReading(slots("xue2 xi2", "学习"), "marks")).toBe("xuéxí");
    expect(joinReading(slots("xue2 xi2", "学习"), "numbers")).toBe("xue2 xi2");
    expect(joinReading(slots("xue2 xi2", "学习"), "none")).toBe("xuexi");
    expect(joinReading(slots("xi1 an1", "西安"), "marks")).toBe("xī'ān");
    expect(joinReading(slots("xi1 an1", "西安"), "none")).toBe("xi'an");
    expect(joinReading(slots("yi1 dian3 r5", "一点儿"), "marks")).toBe("yīdiǎnr");
    expect(joinReading(slots("yi1 hui4 r5", "一会儿"), "numbers")).toBe("yi1 huir4");
    expect(joinReading(slots("wo3 men5", "我们"), "marks")).toBe("wǒmen");
    expect(joinReading(slots("hua1 er2", "花儿"), "marks")).toBe("huā'ér");
  });
});
