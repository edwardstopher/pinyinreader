import { describe, expect, it } from "vitest";
import { detectScript, toSimplified, toTraditional } from "../src/convert";

describe("simplified and traditional conversion", () => {
  it("converts phrases, not isolated characters, and keeps spacing", async () => {
    expect(await toTraditional("头发")).toBe("頭髮");
    expect(await toTraditional("软件")).toBe("軟件");
    expect(await toTraditional("皇后")).toBe("皇后");
    expect(await toTraditional("后面")).toBe("後面");
    expect(await toTraditional("干燥")).toBe("乾燥");
    expect(await toTraditional("发现")).toBe("發現");
    expect(await toTraditional("我  喜欢\n学习")).toBe("我  喜歡\n學習");
    expect(await toSimplified("頭髮")).toBe("头发");
    expect(await toSimplified("軟件")).toBe("软件");
    expect(await toSimplified("乾燥")).toBe("干燥");
    expect(await toSimplified("後面")).toBe("后面");
    expect(await toSimplified("漢字")).toBe("汉字");
  });

  it("detects which script a text is mostly in", () => {
    expect(detectScript("我们去公园")).toBe("s");
    expect(detectScript("我們去公園")).toBe("t");
    expect(detectScript("hello")).toBe("none");
  });
});
