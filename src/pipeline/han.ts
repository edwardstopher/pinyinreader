/** Han characters we are willing to annotate, including extensions and 〇. */
export function isHan(cp: number): boolean {
  return (
    cp === 0x3007 || // 〇
    (cp >= 0x3400 && cp <= 0x4dbf) || // Ext A
    (cp >= 0x4e00 && cp <= 0x9fff) || // Unified
    (cp >= 0xf900 && cp <= 0xfaff) || // Compatibility
    (cp >= 0x20000 && cp <= 0x2a6df) || // Ext B
    (cp >= 0x2a700 && cp <= 0x2b73f) || // Ext C
    (cp >= 0x2b740 && cp <= 0x2b81f) || // Ext D
    (cp >= 0x2b820 && cp <= 0x2ceaf) || // Ext E
    (cp >= 0x2ceb0 && cp <= 0x2ebef) || // Ext F
    (cp >= 0x2ebf0 && cp <= 0x2ee5f) || // Ext I
    (cp >= 0x2f800 && cp <= 0x2fa1f) || // Compatibility supplement
    (cp >= 0x30000 && cp <= 0x3134f) || // Ext G
    (cp >= 0x31350 && cp <= 0x323af) || // Ext H
    (cp >= 0x323b0 && cp <= 0x3347f) // Ext J
  );
}

export function isDigit(ch: string): boolean {
  return /[0-9]/.test(ch) || /[\uFF10-\uFF19]/.test(ch);
}

export function isPunctChar(ch: string): boolean {
  return /\p{P}/u.test(ch);
}

const OPENING = new Set(
  Array.from("「『《〈（【〔〖〝“‘(＜<"),
);
const CLOSING = new Set(
  Array.from("」』》〉）】〕〗〞，。、；：？！…～·・,.!?;:)]}＞>\"”’、"),
);

export function isOpeningPunct(text: string): boolean {
  return [...text].every((ch) => OPENING.has(ch));
}

export function isClosingPunct(text: string): boolean {
  return [...text].every((ch) => CLOSING.has(ch));
}

/** Sentence-ending punctuation. Newlines are handled separately. */
export function endsSentence(text: string): boolean {
  return /[。！？!?；]/.test(text);
}
