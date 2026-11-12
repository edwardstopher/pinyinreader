import type { Script } from "./convert";

export function supportsSpeech(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function chineseVoices(): SpeechSynthesisVoice[] {
  if (!supportsSpeech()) return [];
  return window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("zh"));
}

function pickVoice(script: Script, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  const want = script === "t" ? "zh-tw" : "zh-cn";
  return (
    voices.find((voice) => voice.lang.toLowerCase().replace("_", "-").startsWith(want)) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("zh")) ??
    null
  );
}

export function stopSpeech(): void {
  if (supportsSpeech()) window.speechSynthesis.cancel();
}

function chunks(text: string): string[] {
  const parts = text
    .split(/(?<=[。！？!?；\n])/)
    .map((part) => part.trim())
    .filter(Boolean);
  const limited: string[] = [];
  for (const part of parts.length > 0 ? parts : [text]) {
    if ([...part].length <= 180) {
      limited.push(part);
      continue;
    }
    let rest = part;
    while ([...rest].length > 180) {
      const chars = [...rest];
      limited.push(chars.slice(0, 180).join(""));
      rest = chars.slice(180).join("");
    }
    if (rest) limited.push(rest);
  }
  return limited;
}

export function speakParts(
  parts: { text: string; sentence: number }[],
  rate: number,
  script: Script,
  onSentence: (sentence: number) => void,
): void {
  if (!supportsSpeech()) return;
  window.speechSynthesis.cancel();
  const voices = chineseVoices();
  const voice = pickVoice(script, voices);
  const queue = parts.flatMap((part) => chunks(part.text).map((text) => ({ text, sentence: part.sentence })));
  let index = 0;
  const next = () => {
    const item = queue[index];
    if (!item) {
      onSentence(-1);
      return;
    }
    onSentence(item.sentence);
    const utter = new SpeechSynthesisUtterance(item.text);
    utter.rate = rate;
    utter.lang = voice?.lang || (script === "t" ? "zh-TW" : "zh-CN");
    if (voice) utter.voice = voice;
    utter.onend = () => {
      index += 1;
      next();
    };
    utter.onerror = () => onSentence(-1);
    window.speechSynthesis.speak(utter);
  };
  next();
}
