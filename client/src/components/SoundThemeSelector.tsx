import { useState } from "react";
import { getBGMThemes, startBGM, stopBGM, switchBGM, isBGMEnabled, type BGMTheme } from "@/lib/soundSystem";
import { LANGUAGE_NAMES, type GameLanguage } from "@/lib/voiceAnnouncer";
import { Volume2, VolumeX, ChevronDown, ChevronUp } from "lucide-react";

const LANGUAGES: GameLanguage[] = ["hi", "en", "ta", "te", "kn", "ml", "bn", "mr", "gu"];

interface SoundThemeSelectorProps {
  currentTheme: BGMTheme;
  currentLanguage: GameLanguage;
  isMusicOn: boolean;
  onThemeChange: (t: BGMTheme) => void;
  onLanguageChange: (l: GameLanguage) => void;
  onMusicToggle: () => void;
}

export default function SoundThemeSelector({
  currentTheme, currentLanguage, isMusicOn,
  onThemeChange, onLanguageChange, onMusicToggle,
}: SoundThemeSelectorProps) {
  const [open, setOpen] = useState(false);
  const themes = getBGMThemes();

  return (
    <div className="relative z-20">
      {/* Toggle bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMusicToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all"
          style={{
            background: isMusicOn ? "rgba(0,217,255,0.15)" : "rgba(255,255,255,0.05)",
            borderColor: isMusicOn ? "#00D9FF" : "rgba(255,255,255,0.2)",
            color: isMusicOn ? "#00D9FF" : "#888",
          }}
        >
          {isMusicOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          {themes[currentTheme].emoji} {isMusicOn ? themes[currentTheme].name : "Muted"}
        </button>
        <button
          onClick={() => setOpen(p => !p)}
          className="p-1.5 rounded-full border"
          style={{ borderColor: "rgba(255,255,255,0.2)", color: "#aaa" }}
        >
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute top-10 left-0 w-72 rounded-2xl border p-4 shadow-2xl z-50 space-y-4"
          style={{
            background: "linear-gradient(135deg, #0d0416 0%, #1a0a2e 100%)",
            borderColor: "#00D9FF40",
          }}
        >
          {/* BGM Themes */}
          <div>
            <p className="text-xs font-bold text-[#00D9FF] mb-2 uppercase tracking-wider">🎵 Background Music</p>
            <div className="grid grid-cols-1 gap-1.5">
              {(Object.entries(themes) as [BGMTheme, { name: string; emoji: string; desc: string }][]).map(([id, t]) => (
                <button
                  key={id}
                  onClick={() => { onThemeChange(id); setOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all"
                  style={{
                    background: currentTheme === id ? "rgba(0,217,255,0.2)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${currentTheme === id ? "#00D9FF" : "rgba(255,255,255,0.08)"}`,
                    color: currentTheme === id ? "#00D9FF" : "#ccc",
                  }}
                >
                  <span className="text-xl">{t.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-[10px] opacity-60">{t.desc}</p>
                  </div>
                  {currentTheme === id && <span className="ml-auto text-[#00D9FF]">▶</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Language */}
          <div>
            <p className="text-xs font-bold text-[#E91E8C] mb-2 uppercase tracking-wider">🗣️ Voice Language</p>
            <div className="grid grid-cols-3 gap-1.5">
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  onClick={() => { onLanguageChange(lang); }}
                  className="px-2 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: currentLanguage === lang ? "rgba(233,30,140,0.25)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${currentLanguage === lang ? "#E91E8C" : "rgba(255,255,255,0.08)"}`,
                    color: currentLanguage === lang ? "#E91E8C" : "#bbb",
                  }}
                >
                  {LANGUAGE_NAMES[lang]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
