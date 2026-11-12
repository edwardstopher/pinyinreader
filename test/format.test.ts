import { describe, expect, it } from "vitest";
import { formatClassifier, splitClassifiers } from "../src/dict/format";

describe("measure words", () => {
  it("splits classifiers on commas outside the pinyin brackets", () => {
    expect(splitClassifiers("家[jia1],個|个[ge4]")).toEqual(["家[jia1]", "個|个[ge4]"]);
    expect(formatClassifier("家[jia1]")).toBe("家 jiā");
    expect(formatClassifier("個|个[ge4]")).toBe("个 個 gè");
  });
});