// ============================================================
// VOICE ANNOUNCER — "Kali hai" / "Jotta hai" in 9 languages
// Uses Web Speech API (works in browser/Android WebView)
// ============================================================

export type GameLanguage =
  | "hi" | "en" | "ta" | "te" | "kn" | "ml" | "bn" | "mr" | "gu";

interface VoiceLines {
  odd: string[];
  even: string[];
  hiding: string[];
  guessOdd: string[];
  guessEven: string[];
  win: string[];
  lose: string[];
}

const VOICE_LINES: Record<GameLanguage, VoiceLines> = {
  hi: {
    odd:       ["कली है!", "कली! विषम संख्या!", "अरे, कली निकली!"],
    even:      ["जोट्टा है!", "जोट्टा! सम संख्या!", "वाह, जोट्टा!"],
    hiding:    ["मुट्ठी बंद करो!", "छुपाओ!", "देखने मत देना!"],
    guessOdd:  ["कली लगाई!", "विषम का दांव!", "कली बोला!"],
    guessEven: ["जोट्टा लगाया!", "सम का दांव!", "जोट्टा बोला!"],
    win:       ["जीत गए! शाबाश!", "वाह! क्या खेल है!"],
    lose:      ["हार गए! अगली बार!", "कोई बात नहीं, फिर खेलो!"],
  },
  en: {
    odd:       ["Kali! It's odd!", "Kali hai — odd number!", "Odd! Kali wins!"],
    even:      ["Jotta! It's even!", "Jotta hai — even number!", "Even! Jotta wins!"],
    hiding:    ["Hiding marbles!", "Close your fist!", "Don't show them!"],
    guessOdd:  ["Guessing odd — Kali!", "I say Kali!", "Odd is my bet!"],
    guessEven: ["Guessing even — Jotta!", "I say Jotta!", "Even is my bet!"],
    win:       ["You win! Amazing!", "Brilliant play!"],
    lose:      ["Better luck next time!", "Try again!"],
  },
  ta: {
    odd:       ["கலி! ஒற்றை எண்!", "கலி ஐ!", "ஒற்றை — கலி!"],
    even:      ["ஜோட்டா! இரட்டை எண்!", "ஜோட்டா ஐ!", "இரட்டை — ஜோட்டா!"],
    hiding:    ["மறைத்துக்கொள்ளுங்கள்!", "கை மூடுங்கள்!"],
    guessOdd:  ["கலி என்று சொல்கிறேன்!"],
    guessEven: ["ஜோட்டா என்று சொல்கிறேன்!"],
    win:       ["வென்றீர்கள்! சபாஷ்!"],
    lose:      ["அடுத்த முறை வெல்வீர்கள்!"],
  },
  te: {
    odd:       ["కలి! బేసి సంఖ్య!", "కలి ఐ!", "బేసి — కలి!"],
    even:      ["జోట్టా! సరి సంఖ్య!", "జోట్టా ఐ!", "సరి — జోట్టా!"],
    hiding:    ["దాచండి!", "చేయి మూయండి!"],
    guessOdd:  ["కలి అంటున్నాను!"],
    guessEven: ["జోట్టా అంటున్నాను!"],
    win:       ["గెలిచారు! బాగుంది!"],
    lose:      ["తర్వాత గెలవండి!"],
  },
  kn: {
    odd:       ["ಕಲಿ! ಬೆಸ ಸಂಖ್ಯೆ!", "ಕಲಿ ಐ!", "ಬೆಸ — ಕಲಿ!"],
    even:      ["ಜೋಟ್ಟಾ! ಸಮ ಸಂಖ್ಯೆ!", "ಜೋಟ್ಟಾ ಐ!", "ಸಮ — ಜೋಟ್ಟಾ!"],
    hiding:    ["ಅಡಗಿಸಿ!", "ಕೈ ಮುಚ್ಚಿ!"],
    guessOdd:  ["ಕಲಿ ಎನ್ನುತ್ತೇನೆ!"],
    guessEven: ["ಜೋಟ್ಟಾ ಎನ್ನುತ್ತೇನೆ!"],
    win:       ["ಗೆದ್ದಿರಿ! ಭಲೇ!"],
    lose:      ["ಮುಂದಿನ ಸಲ ಗೆಲ್ಲಿ!"],
  },
  ml: {
    odd:       ["കലി! ഒറ്റ സംഖ്യ!", "കലി ആണ്!", "ഒറ്റ — കലി!"],
    even:      ["ജോട്ടാ! ഇരട്ട സംഖ്യ!", "ജോട്ടാ ആണ്!", "ഇരട്ട — ജോട്ടാ!"],
    hiding:    ["ഒളിപ്പിക്കൂ!", "കൈ അടക്കൂ!"],
    guessOdd:  ["കലി എന്ന് ഞാൻ പറയുന്നു!"],
    guessEven: ["ജോട്ടാ എന്ന് ഞാൻ പറയുന്നു!"],
    win:       ["ജയിച്ചു! ഗംഭീരം!"],
    lose:      ["അടുത്ത തവണ ജയിക്കൂ!"],
  },
  bn: {
    odd:       ["কালি! বিজোড় সংখ্যা!", "কালি হাই!", "বিজোড় — কালি!"],
    even:      ["জোট্টা! জোড় সংখ্যা!", "জোট্টা হাই!", "জোড় — জোট্টা!"],
    hiding:    ["লুকিয়ে ফেলো!", "হাত বন্ধ করো!"],
    guessOdd:  ["কালি বলছি!"],
    guessEven: ["জোট্টা বলছি!"],
    win:       ["জিতেছ! দারুণ!"],
    lose:      ["পরের বার জিতবে!"],
  },
  mr: {
    odd:       ["काळी! विषम संख्या!", "काळी आहे!", "विषम — काळी!"],
    even:      ["जोट्टा! सम संख्या!", "जोट्टा आहे!", "सम — जोट्टा!"],
    hiding:    ["लपवा!", "मूठ बंद करा!"],
    guessOdd:  ["काळी म्हणतो!"],
    guessEven: ["जोट्टा म्हणतो!"],
    win:       ["जिंकलात! शाब्बास!"],
    lose:      ["पुढच्या वेळी जिंका!"],
  },
  gu: {
    odd:       ["કળી! વિષમ સંખ્યા!", "કળી છે!", "વિષમ — કળી!"],
    even:      ["જોટ્ટા! સમ સંખ્યા!", "જોટ્ટા છે!", "સમ — જોટ્ટા!"],
    hiding:    ["છુપાવો!", "મુઠ્ઠી બંધ કરો!"],
    guessOdd:  ["કળી કહું છું!"],
    guessEven: ["જોટ્ટા કહું છું!"],
    win:       ["જીત્યા! શાબ્બાશ!"],
    lose:      ["આગળ વખતે જીતો!"],
  },
};

// Language display names
export const LANGUAGE_NAMES: Record<GameLanguage, string> = {
  hi: "हिंदी",
  en: "English",
  ta: "தமிழ்",
  te: "తెలుగు",
  kn: "ಕನ್ನಡ",
  ml: "മലയാളം",
  bn: "বাংলা",
  mr: "मराठी",
  gu: "ગુજરાતી",
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isSpeechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function speak(text: string, lang: string) {
  if (!isSpeechAvailable()) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 1.0;
  utter.pitch = 1.1;
  utter.volume = 1.0;

  // Try to pick a voice for the language
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find(v => v.lang.startsWith(lang.split("-")[0]));
  if (match) utter.voice = match;

  window.speechSynthesis.speak(utter);
}

const LANG_CODES: Record<GameLanguage, string> = {
  hi: "hi-IN", en: "en-IN", ta: "ta-IN", te: "te-IN",
  kn: "kn-IN", ml: "ml-IN", bn: "bn-IN", mr: "mr-IN", gu: "gu-IN",
};

export function announceResult(isOdd: boolean, language: GameLanguage) {
  const lines = VOICE_LINES[language];
  const text = isOdd ? pick(lines.odd) : pick(lines.even);
  speak(text, LANG_CODES[language]);
}

export function announceHiding(language: GameLanguage) {
  const text = pick(VOICE_LINES[language].hiding);
  speak(text, LANG_CODES[language]);
}

export function announceGuess(isOdd: boolean, language: GameLanguage) {
  const lines = VOICE_LINES[language];
  const text = isOdd ? pick(lines.guessOdd) : pick(lines.guessEven);
  speak(text, LANG_CODES[language]);
}

export function announceWin(language: GameLanguage) {
  speak(pick(VOICE_LINES[language].win), LANG_CODES[language]);
}

export function announceLose(language: GameLanguage) {
  speak(pick(VOICE_LINES[language].lose), LANG_CODES[language]);
}
