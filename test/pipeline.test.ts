import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { parseDict } from "../src/dict/parse";
import { annotate } from "../src/pipeline/annotate";
import { chunkText, groupTokens } from "../src/pipeline/group";
import { joinReading } from "../src/pipeline/pinyin";
import type { Dictionary } from "../src/dict/types";
import type { WordToken } from "../src/pipeline/types";

const require = createRequire(import.meta.url);
const { gunzipSync } = require("node:zlib") as typeof import("node:zlib");

let dict: Dictionary;

function loadDict(): Dictionary {
  if (!dict) {
    const text = gunzipSync(readFileSync("public/dict/cedict.txt.gz")).toString("utf8");
    dict = parseDict(text);
  }
  return dict;
}

function words(text: string, extra: { grouping?: "word" | "char"; corrections?: { text: string; occurrence: number | "all"; pinyin: string }[] } = {}): WordToken[] {
  return annotate(text, { dict: loadDict(), ...extra }).filter((token): token is WordToken => token.kind === "word");
}

function reading(text: string, surface: string): string {
  const token = words(text).find((item) => item.text === surface);
  if (!token) throw new Error(`missing word ${surface} in ${words(text).map((item) => item.text).join("|")}`);
  return joinReading(token.slots, "marks");
}

function surfaces(text: string): string[] {
  return words(text).map((token) => token.text);
}

function roundTrip(text: string) {
  const tokens = annotate(text, { dict: loadDict() });
  expect(tokens.map((token) => token.text).join("")).toBe(text);
  for (const token of tokens) expect(text.slice(token.start, token.end)).toBe(token.text);
  const chunks = groupTokens(tokens);
  expect(chunks.map((chunk) => chunkText(chunk)).join("")).toBe(text);
  return tokens;
}

describe("text scan", () => {
  it("preserves spaces, blank lines, punctuation and markup as text", () => {
    const nasty = "a  b\n\nc\t<d>\u3000〇";
    const tokens = roundTrip(nasty);
    expect(tokens.some((token) => token.kind === "space" && token.text.includes("  "))).toBe(true);
    expect(tokens.filter((token) => token.kind === "break")).toHaveLength(2);
    const script = "<script>alert(1)</script>";
    const parsed = roundTrip(script);
    expect(parsed.some((token) => token.kind === "word")).toBe(false);
    expect(parsed.map((token) => token.text).join("")).toBe(script);
  });

  it("does not split rare or astral characters and leaves numerals alone", () => {
    const rare = roundTrip("龦〇𠀋𠀋");
    const han = rare.filter((token) => token.kind === "word");
    expect(han.map((token) => token.text)).toEqual(["龦", "〇", "𠀋", "𠀋"]);
    expect([...han[2].text]).toHaveLength(1);
    expect(reading("〇", "〇")).toBe("líng");
    const numerals = roundTrip("第3个１２３和123。");
    const plain = numerals.filter((token) => token.kind === "plain").map((token) => token.text);
    expect(plain).toContain("3");
    expect(plain).toContain("１２３");
    expect(plain).toContain("123");
    expect(words("三个人").some((token) => token.text === "三" || token.text.includes("三"))).toBe(true);
    expect(reading("三", "三")).toBe("sān");
  });

  it("gives full-width punctuation no reading and keeps it with the previous word", () => {
    const tokens = roundTrip("学习，你好。");
    expect(tokens.find((token) => token.text === "，")?.kind).toBe("punct");
    expect(tokens.find((token) => token.text === "。")?.kind).toBe("punct");
    const unit = groupTokens(tokens).find((chunk) => chunk.type === "unit" && chunk.body.some((token) => token.text === "学习"));
    expect(unit && unit.type === "unit" && unit.closes.some((token) => token.text === "，")).toBe(true);
    const quoted = roundTrip("「学习」。");
    const quotedUnit = groupTokens(quoted).find((chunk) => chunk.type === "unit" && chunk.body.some((token) => token.text === "学习"));
    expect(quotedUnit && quotedUnit.type === "unit").toBe(true);
    if (quotedUnit && quotedUnit.type === "unit") {
      expect(quotedUnit.opens.map((token) => token.text).join("")).toBe("「");
      expect(quotedUnit.closes.map((token) => token.text).join("")).toContain("」");
      expect(quotedUnit.closes.map((token) => token.text).join("")).toContain("。");
    }
  });

  it("keeps a long passage intact across chunks", () => {
    const text = `${"学习汉语，".repeat(1800)}\n${"我们去公园。".repeat(1800)}`;
    const tokens = roundTrip(text);
    expect(tokens.length).toBeGreaterThan(1000);
    expect(tokens.map((token) => token.text).join("")).toBe(text);
  });

  it("passes URLs through untouched", () => {
    const url = "见 https://pinyinme.com/汉字 结束";
    const tokens = roundTrip(url);
    expect(tokens.some((token) => token.kind === "plain" && token.text.startsWith("https://"))).toBe(true);
    expect(tokens.some((token) => token.kind === "word" && token.text === "汉字")).toBe(false);
  });
});

describe("word readings", () => {
  it("segments into words and resolves polyphones from the dictionary", () => {
    expect(surfaces("我想学中文")).toEqual(["我", "想", "学", "中文"]);
    expect(surfaces("研究生命起源")).toEqual(["研究", "生命", "起源"]);
    expect(reading("学习汉语", "学习")).toBe("xuéxí");
    expect(reading("银行", "银行")).toBe("yínháng");
    expect(reading("行走", "行走")).toBe("xíngzǒu");
    expect(reading("行长", "行长")).toBe("hángzhǎng");
    expect(reading("长度", "长度")).toBe("chángdù");
    expect(reading("长大", "长大")).toBe("zhǎngdà");
    expect(reading("还书", "还书")).toBe("huánshū");
    expect(reading("还是", "还是")).toBe("háishi");
    expect(reading("目的", "目的")).toBe("mùdì");
    expect(reading("的士", "的士")).toBe("dīshì");
    expect(reading("我的书", "的")).toBe("de");
  });

  it("uses neutral tone and erhua instead of citation readings", () => {
    expect(reading("我们", "我们")).toBe("wǒmen");
    expect(reading("好了", "了")).toBe("le");
    expect(reading("了解", "了解")).toBe("liǎojiě");
    expect(reading("一点儿", "一点儿")).toBe("yīdiǎnr");
    expect(reading("坐一会儿", "一会儿")).toBe("yīhuìr");
    expect(reading("那儿", "那儿")).toBe("nàr");
    expect(reading("头发", "头发")).toBe("tóufa");
    expect(reading("跑得很快", "得很")).toBe("dehěn");
    expect(reading("说得好", "得")).toBe("de");
    expect(words("说得好").find((token) => token.text === "得")?.lowConfidence).toBe(true);
    expect(reading("我得走", "得")).toBe("děi");
    expect(reading("得到", "得到")).toBe("dédào");
    expect(reading("得亏", "得亏")).toBe("děikuī");
  });

  it("annotates traditional text with the same readings", () => {
    expect(reading("學習", "學習")).toBe("xuéxí");
    expect(reading("銀行", "銀行")).toBe("yínháng");
    expect(reading("頭髮", "頭髮")).toBe("tóufa");
    expect(reading("乾燥", "乾燥")).toBe("gānzào");
    expect(reading("我們", "我們")).toBe("wǒmen");
    const learned = words("學習")[0];
    expect(learned?.hsk2).toBe(1);
  });

  it("can fall back to a character at a time", () => {
    expect(surfaces("学习汉语")).not.toEqual(["学", "习", "汉", "语"]);
    expect(words("学习汉语", { grouping: "char" }).map((token) => token.text)).toEqual(["学", "习", "汉", "语"]);
    expect(words("一点儿", { grouping: "char" }).map((token) => joinReading(token.slots, "marks"))).toEqual(["yī", "diǎn", "r"]);
  });

  it("stores a reading correction for one occurrence or the whole document", () => {
    const once = words("还书再还书", {
      corrections: [{ text: "还书", occurrence: 0, pinyin: "hai2 shu1" }],
    });
    const both = once.filter((token) => token.text === "还书");
    expect(joinReading(both[0].slots, "marks")).toBe("háishū");
    expect(joinReading(both[1].slots, "marks")).toBe("huánshū");
    expect(both[0].corrected).toBe(true);
    const all = words("还书再还书", {
      corrections: [{ text: "还书", occurrence: "all", pinyin: "hai2 shu1" }],
    }).filter((token) => token.text === "还书");
    expect(all.every((token) => joinReading(token.slots, "marks") === "háishū")).toBe(true);
  });

  it("attaches HSK levels used by selective pinyin", () => {
    const learned = words("学习")[0];
    const bank = words("银行")[0];
    expect(learned?.hsk2).toBe(1);
    expect(learned?.hsk3).toBe(1);
    expect(learned?.freq).toBe(789);
    expect(bank?.hsk2).toBe(3);
    expect(words("一点儿")[0]?.hsk3).toBe(1);
  });
});

describe("dictionary file", () => {
  it("parses the shipped CC-CEDICT derivative", () => {
    const parsed = loadDict();
    expect(parsed.version).toBe("2026-11-12");
    expect(parsed.entries.length).toBeGreaterThan(100000);
    const study = parsed.lookup("学习");
    expect(study?.[0]?.pinyin).toBe("xue2 xi2");
    expect(study?.[0]?.senses.length).toBeGreaterThan(0);
    expect(parsed.lookup("銀行")?.[0]?.pinyin).toBe("yin2 hang2");
  });
});
