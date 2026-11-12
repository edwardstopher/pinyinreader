import { useRef } from "react";
import { FREQ_OPTIONS, HSK_MAX, type Preset, type Settings, type StyleSettings } from "../model";

function Slider({
  label,
  min,
  max,
  step,
  value,
  unit,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="slider">
      <span>{label}</span>
      <span className="slider-value">{value}{unit ?? ""}</span>
      <input type="range" min={min} max={max} step={step} value={value} aria-valuetext={`${value}${unit ?? ""}`} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function Choice<T extends string>({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="choice">
      <legend>{label}</legend>
      <div className="segmented">
        {options.map((option) => (
          <label key={option.value} className={value === option.value ? "on" : ""}>
            <input type="radio" name={name} checked={value === option.value} onChange={() => onChange(option.value)} />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function SettingsPanel({
  settings,
  presets,
  defaultPresetId,
  onChange,
  onStyle,
  onApplyPreset,
  onSavePreset,
  onDeletePreset,
  onDefault,
  onImport,
  onClose,
}: {
  settings: Settings;
  presets: Preset[];
  defaultPresetId: string;
  onChange: (patch: Partial<Settings>) => void;
  onStyle: (patch: Partial<StyleSettings>) => void;
  onApplyPreset: (id: string) => void;
  onSavePreset: (name: string) => void;
  onDeletePreset: (id: string) => void;
  onDefault: (id: string) => void;
  onImport: (presets: Preset[]) => void;
  onClose: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const hskMax = HSK_MAX[settings.hskSyllabus];
  return (
    <div className="settings">
      <div className="drawer-bar">
        <h2 id="style-title">Style</h2>
        <button type="button" onClick={onClose} aria-label="Close style settings">Close</button>
      </div>
      <Choice label="Pinyin position" name="position" value={settings.position} onChange={(position) => onStyle({ position })} options={[
        { value: "above", label: "Above" },
        { value: "below", label: "Below" },
        { value: "inline", label: "Inline" },
        { value: "hidden", label: "Hidden" },
      ]} />
      <Choice label="Grouping" name="grouping" value={settings.grouping} onChange={(grouping) => onStyle({ grouping })} options={[
        { value: "word", label: "Words" },
        { value: "char", label: "Characters" },
      ]} />
      <Choice label="Tones" name="tones" value={settings.toneFormat} onChange={(toneFormat) => onStyle({ toneFormat })} options={[
        { value: "marks", label: "Marks" },
        { value: "numbers", label: "Numbers" },
        { value: "none", label: "No tones" },
      ]} />
      <Choice label="Color by tone" name="color" value={settings.toneColor} onChange={(toneColor) => onStyle({ toneColor })} options={[
        { value: "off", label: "Off" },
        { value: "pinyin", label: "Pinyin" },
        { value: "chars", label: "Characters" },
        { value: "both", label: "Both" },
      ]} />
      <Choice label="Color scheme" name="scheme" value={settings.toneScheme} onChange={(toneScheme) => onStyle({ toneScheme })} options={[
        { value: "classic", label: "Classic" },
        { value: "colorblind", label: "Colorblind-safe" },
      ]} />
      <Choice label="Character font" name="han" value={settings.hanFont} onChange={(hanFont) => onStyle({ hanFont })} options={[
        { value: "sans", label: "Sans" },
        { value: "song", label: "Song" },
        { value: "kai", label: "Kai" },
      ]} />
      <Choice label="Pinyin font" name="pyfont" value={settings.pyFont} onChange={(pyFont) => onStyle({ pyFont })} options={[
        { value: "sans", label: "Sans" },
        { value: "serif", label: "Serif" },
        { value: "readable", label: "Readable" },
      ]} />
      <Choice label="Theme" name="theme" value={settings.theme} onChange={(theme) => onStyle({ theme })} options={[
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
        { value: "sepia", label: "Sepia" },
        { value: "contrast", label: "Contrast" },
      ]} />
      <Slider label="Character size" min={18} max={64} step={1} value={settings.hanSize} unit="px" onChange={(hanSize) => onStyle({ hanSize })} />
      <Slider label="Pinyin size" min={10} max={36} step={1} value={settings.pySize} unit="px" onChange={(pySize) => onStyle({ pySize })} />
      <Slider label="Character spacing" min={0} max={16} step={1} value={settings.charSpacing} unit="px" onChange={(charSpacing) => onStyle({ charSpacing })} />
      <Slider label="Word spacing" min={0} max={28} step={1} value={settings.wordSpacing} unit="px" onChange={(wordSpacing) => onStyle({ wordSpacing })} />
      <Slider label="Line height" min={1.3} max={2.8} step={0.05} value={settings.lineHeight} onChange={(lineHeight) => onStyle({ lineHeight: Math.round(lineHeight * 100) / 100 })} />
      <Slider label="Paragraph spacing" min={0} max={48} step={1} value={settings.paragraphSpacing} unit="px" onChange={(paragraphSpacing) => onStyle({ paragraphSpacing })} />
      <Slider label="Line width" min={0} max={70} step={1} value={settings.measure} unit={settings.measure === 0 ? " full" : " chars"} onChange={(measure) => onStyle({ measure })} />
      <fieldset className="choice">
        <legend>Selective pinyin</legend>
        <Choice label="Syllabus" name="syllabus" value={settings.hskSyllabus} onChange={(hskSyllabus) => onStyle({ hskSyllabus, hskHide: Math.min(settings.hskHide, HSK_MAX[hskSyllabus]) })} options={[
          { value: "2", label: "HSK 2.0" },
          { value: "3", label: "HSK 3.0" },
        ]} />
        <Slider label="Hide pinyin up to HSK" min={0} max={hskMax} step={1} value={Math.min(settings.hskHide, hskMax)} onChange={(hskHide) => onStyle({ hskHide })} />
        <label className="slider">
          <span>Also hide frequent words</span>
          <select value={settings.freqHide} onChange={(event) => onStyle({ freqHide: Number(event.target.value) })}>
            {FREQ_OPTIONS.map((value) => (
              <option key={value} value={value}>{value === 0 ? "Off" : `Top ${value.toLocaleString()}`}</option>
            ))}
          </select>
        </label>
        <p className="field-help">Words at or below the HSK level, and words in the top of the frequency list, lose their pinyin until you tap them. Words with no level stay visible.</p>
      </fieldset>
      <Choice label="Open definitions" name="trigger" value={settings.dictTrigger} onChange={(dictTrigger) => onChange({ dictTrigger })} options={[
        { value: "click", label: "Click" },
        { value: "hover", label: "Hover" },
      ]} />
      <label className="check">
        <input type="checkbox" checked={settings.dictPinned} onChange={(event) => onChange({ dictPinned: event.target.checked })} />
        Keep the dictionary beside the text on a wide screen
      </label>
      <fieldset className="choice">
        <legend>Print</legend>
        <label className="slider">
          <span>Style</span>
          <select value={settings.print.presetId ?? ""} onChange={(event) => onChange({ print: { ...settings.print, presetId: event.target.value || null } })}>
            <option value="">Current style</option>
            {presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.name}</option>)}
          </select>
        </label>
        <Choice label="Paper" name="paper" value={settings.print.paper} onChange={(paper) => onChange({ print: { ...settings.print, paper } })} options={[
          { value: "a4", label: "A4" },
          { value: "letter", label: "Letter" },
        ]} />
        <Choice label="Orientation" name="orient" value={settings.print.orientation} onChange={(orientation) => onChange({ print: { ...settings.print, orientation } })} options={[
          { value: "portrait", label: "Portrait" },
          { value: "landscape", label: "Landscape" },
        ]} />
        <Slider label="Margin" min={10} max={28} step={1} value={settings.print.marginMm} unit="mm" onChange={(marginMm) => onChange({ print: { ...settings.print, marginMm } })} />
        <Choice label="Tones on paper" name="printtone" value={settings.print.toneMode} onChange={(toneMode) => onChange({ print: { ...settings.print, toneMode } })} options={[
          { value: "color", label: "Color" },
          { value: "grayscale", label: "Black" },
          { value: "patterns", label: "Underlines" },
        ]} />
        <Slider label="Minimum pinyin size" min={8} max={14} step={0.5} value={settings.print.minPinyinPt} unit="pt" onChange={(minPinyinPt) => onChange({ print: { ...settings.print, minPinyinPt } })} />
        <p className="field-help">Print uses the browser dialog, including Save as PDF. Only the text is printed. Turn off “Headers and footers” in that dialog so the page number line from the browser is left out.</p>
      </fieldset>
      <fieldset className="choice">
        <legend>Presets</legend>
        <ul className="presets">
          {presets.map((preset) => (
            <li key={preset.id}>
              <button type="button" onClick={() => onApplyPreset(preset.id)}>{preset.name}</button>
              <button type="button" onClick={() => onDefault(preset.id)} aria-pressed={defaultPresetId === preset.id}>
                {defaultPresetId === preset.id ? "Default" : "Make default"}
              </button>
              {preset.builtin ? null : <button type="button" onClick={() => onDeletePreset(preset.id)}>Delete</button>}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => {
            const name = window.prompt("Preset name");
            if (name?.trim()) onSavePreset(name.trim());
          }}
        >
          Save current style
        </button>
        <button
          type="button"
          onClick={() => {
            const blob = new Blob([JSON.stringify({ kind: "pinyinme-presets", version: 1, presets }, null, 2)], { type: "application/json" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "pinyinme-presets.json";
            link.click();
            URL.revokeObjectURL(link.href);
          }}
        >
          Export presets
        </button>
        <button type="button" onClick={() => fileRef.current?.click()}>Import presets</button>
        <input
          ref={fileRef}
          hidden
          type="file"
          accept="application/json,.json"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            try {
              const parsed = JSON.parse(await file.text()) as { presets?: Preset[] };
              if (Array.isArray(parsed.presets)) onImport(parsed.presets);
            } catch {
              /* leave the current presets in place */
            }
          }}
        />
      </fieldset>
    </div>
  );
}
