import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { themeBackgrounds, toneColors, uiInk } from "../src/theme";

function linear(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const raw = hex.slice(1);
  const r = linear(parseInt(raw.slice(0, 2), 16));
  const g = linear(parseInt(raw.slice(2, 4), 16));
  const b = linear(parseInt(raw.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const left = luminance(a);
  const right = luminance(b);
  const [high, low] = left > right ? [left, right] : [right, left];
  return (high + 0.05) / (low + 0.05);
}

function hexes(value: unknown, found: string[] = []): string[] {
  if (typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)) found.push(value);
  else if (value && typeof value === "object") {
    for (const item of Object.values(value)) hexes(item, found);
  }
  return found;
}

describe("tone colors", () => {
  it("keeps small pinyin text at least WCAG AA on each reading surface", () => {
    const pairs: [string, string][] = [
      ...Object.values(toneColors.classic.light).map((hex) => [hex, themeBackgrounds.light] as [string, string]),
      ...Object.values(toneColors.classic.light).map((hex) => [hex, themeBackgrounds.lightPaper] as [string, string]),
      ...Object.values(toneColors.classic.light).map((hex) => [hex, themeBackgrounds.sepia] as [string, string]),
      ...Object.values(toneColors.classic.light).map((hex) => [hex, themeBackgrounds.sepiaPaper] as [string, string]),
      ...Object.values(toneColors.classic.dark).map((hex) => [hex, themeBackgrounds.dark] as [string, string]),
      ...Object.values(toneColors.classic.dark).map((hex) => [hex, themeBackgrounds.darkPaper] as [string, string]),
      ...Object.values(toneColors.classic.contrast).map((hex) => [hex, themeBackgrounds.contrast] as [string, string]),
      ...Object.values(toneColors.classic.print).map((hex) => [hex, "#ffffff"] as [string, string]),
      ...Object.values(toneColors.colorblind.light).map((hex) => [hex, themeBackgrounds.lightPaper] as [string, string]),
      ...Object.values(toneColors.colorblind.dark).map((hex) => [hex, themeBackgrounds.dark] as [string, string]),
      ...Object.values(toneColors.colorblind.print).map((hex) => [hex, "#ffffff"] as [string, string]),
    ];
    for (const [ink, paper] of pairs) expect(contrast(ink, paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(uiInk.light, themeBackgrounds.light)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(uiInk.lightMuted, themeBackgrounds.lightPaper)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(uiInk.dark, themeBackgrounds.dark)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(uiInk.darkMuted, themeBackgrounds.darkPaper)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(uiInk.accentInk, uiInk.accent)).toBeGreaterThanOrEqual(4.5);
  });

  it("uses the same colors in the stylesheet", () => {
    const css = readFileSync("src/styles.css", "utf8").toLowerCase();
    for (const hex of new Set(hexes({ themeBackgrounds, toneColors, uiInk }).map((hex) => hex.toLowerCase()))) {
      expect(css).toContain(hex);
    }
  });
});
