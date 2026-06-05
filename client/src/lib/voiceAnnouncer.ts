export type GameLanguage =
  | "hi" | "en" | "ta" | "te" | "kn" | "ml" | "bn" | "mr" | "gu";

interface VoiceLines {
  oddWin: string[];
  oddLose: string[];
  evenWin: string[];
  evenLose: string[];
  hiding: string[];
  guessOdd: string[];
  guessEven: string[];
}

const VOICE_LINES: Record<GameLanguage, VoiceLines> = {
  hi: {
    oddWin:   ["बधाई हो! कली है, तुम जीत गए!", "कली है! शाबाश, जीत गए!", "कली निकली, तुम जीत गए! वाह!"],
    oddLose:  ["कली है, तुम हार गए!", "हाय! कली थी, अगली बार जीतना!", "कली निकली, हार गए!"],
    evenWin:  ["बधाई हो! जोट्टा है, तुम जीत गए!", "जोट्टा है! शाबाश!", "जोट्टा निकला, तुम जीत गए!"],
    evenLose: ["जोट्टा है, तुम हार गए!", "जोट्टा था, हार गए! अगली बार!", "जोट्टा निकला, हार गए!"],
    hiding:   ["मुट्ठी बंद करो!", "छुपाओ कांचे!", "देखने मत देना!"],
    guessOdd: ["कली! मेरा दांव कली पर!", "कली लगाई!", "विषम — कली बोला!"],
    guessEven:["जोट्टा! मेरा दांव जोट्टा पर!", "जोट्टा लगाया!", "सम — जोट्टा बोला!"],
  },
  en: {
    oddWin:   ["Kali! You win! Congratulations!", "It's Kali — odd! You won!", "Kali hai — you win!"],
    oddLose:  ["Kali! Odd — you lose!", "It's Kali, better luck next time!", "Kali hai — you lost!"],
    evenWin:  ["Jotta! Even — you win!", "It's Jotta — you won! Well done!", "Jotta hai — you win!"],
    evenLose: ["Jotta! Even — you lose!", "It's Jotta, better luck next time!", "Jotta hai — you lost!"],
    hiding:   ["Hide your marbles!", "Close your fist!", "Don't let them see!"],
    guessOdd: ["I guess Kali — odd!", "My bet is Kali!", "Going with Kali!"],
    guessEven:["I guess Jotta — even!", "My bet is Jotta!", "Going with Jotta!"],
  },
  ta: {
    oddWin:   ["வாழ்த்துக்கள்! கலி — நீங்கள் வென்றீர்கள்!"],
    oddLose:  ["கலி — நீங்கள் தோற்றீர்கள்!"],
    evenWin:  ["வாழ்த்துக்கள்! ஜோட்டா — நீங்கள் வென்றீர்கள்!"],
    evenLose: ["ஜோட்டா — நீங்கள் தோற்றீர்கள்!"],
    hiding:   ["மறைத்துக்கொள்ளுங்கள்!"],
    guessOdd: ["கலி என்று சொல்கிறேன்!"],
    guessEven:["ஜோட்டா என்று சொல்கிறேன்!"],
  },
  te: {
    oddWin:   ["అభినందనలు! కలి — మీరు గెలిచారు!"],
    oddLose:  ["కలి — మీరు ఓడిపోయారు!"],
    evenWin:  ["అభినందనలు! జోట్టా — మీరు గెలిచారు!"],
    evenLose: ["జోట్టా — మీరు ఓడిపోయారు!"],
    hiding:   ["దాచండి!"],
    guessOdd: ["కలి అంటున్నాను!"],
    guessEven:["జోట్టా అంటున్నాను!"],
  },
  kn: {
    oddWin:   ["ಅಭಿನಂದನೆಗಳು! ಕಲಿ — ನೀವು ಗೆದ್ದಿರಿ!"],
    oddLose:  ["ಕಲಿ — ನೀವು ಸೋತಿರಿ!"],
    evenWin:  ["ಅಭಿನಂದನೆಗಳು! ಜೋಟ್ಟಾ — ನೀವು ಗೆದ್ದಿರಿ!"],
    evenLose: ["ಜೋಟ್ಟಾ — ನೀವು ಸೋತಿರಿ!"],
    hiding:   ["ಅಡಗಿಸಿ!"],
    guessOdd: ["ಕಲಿ ಎನ್ನುತ್ತೇನೆ!"],
    guessEven:["ಜೋಟ್ಟಾ ಎನ್ನುತ್ತೇನೆ!"],
  },
  ml: {
    oddWin:   ["അഭിനന്ദനങ്ങൾ! കലി — നിങ്ങൾ ജയിച്ചു!"],
    oddLose:  ["കലി — നിങ്ങൾ തോറ്റു!"],
    evenWin:  ["അഭിനന്ദനങ്ങൾ! ജോട്ടാ — നിങ്ങൾ ജയിച്ചു!"],
    evenLose: ["ജോട്ടാ — നിങ്ങൾ തോറ്റു!"],
    hiding:   ["ഒളിപ്പിക്കൂ!"],
    guessOdd: ["കലി എന്ന് ഞാൻ പറയുന്നു!"],
    guessEven:["ജോട്ടാ എന്ന് ഞാൻ പറയുന്നു!"],
  },
  bn: {
    oddWin:   ["অভিনন্দন! কালি — তুমি জিতেছ!"],
    oddLose:  ["কালি — তুমি হেরেছ!"],
    evenWin:  ["অভিনন্দন! জোট্টা — তুমি জিতেছ!"],
    evenLose: ["জোট্টা — তুমি হেরেছ!"],
    hiding:   ["লুকিয়ে ফেলো!"],
    guessOdd: ["কালি বলছি!"],
    guessEven:["জোট্টা বলছি!"],
  },
  mr: {
    oddWin:   ["अभिनंदन! काळी — तुम्ही जिंकलात!"],
    oddLose:  ["काळी — तुम्ही हरलात!"],
    evenWin:  ["अभिनंदन! जोट्टा — तुम्ही जिंकलात!"],
    evenLose: ["जोट्टा — तुम्ही हरलात!"],
    hiding:   ["लपवा!"],
    guessOdd: ["काळी म्हणतो!"],
    guessEven:["जोट्टा म्हणतो!"],
  },
  gu: {
    oddWin:   ["અભિનંદન! કળી — તમે જીત્યા!"],
    oddLose:  ["કળી — તમે હાર્યા!"],
    evenWin:  ["અભિનંદન! જોટ્ટા — તમે જીત્યા!"],
    evenLose: ["જોટ્ટા — તમે હાર્યા!"],
    hiding:   ["છુપાવો!"],
    guessOdd: ["કળી કહું છું!"],
    guessEven:["જોટ્ટા કહું છું!"],
  },
};

export const LANGUAGE_NAMES: Record<GameLanguage, string> = {
  hi: "हिंदी", en: "English", ta: "தமிழ்", te: "తెలుగు",
  kn: "ಕನ್ನಡ", ml: "മലയാളം", bn: "বাংলা", mr: "मराठी", gu: "ગુજરાતી",
};

const LANG_CODES: Record<GameLanguage, string> = {
  hi: "hi-IN", en: "en-IN", ta: "ta-IN", te: "te-IN",
  kn: "kn-IN", ml: "ml-IN", bn: "bn-IN", mr: "mr-IN", gu: "gu-IN",
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function speak(text: string, lang: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 0.9;
  utter.pitch = 1.1;
  utter.volume = 1.0;
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find(v => v.lang.startsWith(lang.split("-")[0]));
  if (match) utter.voice = match;
  window.speechSynthesis.speak(utter);
}

// Main result announcement — "Kali hai tum jeete!" style
export function announceResult(isOdd: boolean, playerWon: boolean, language: GameLanguage) {
  const lines = VOICE_LINES[language];
  let text: string;
  if (isOdd && playerWon)   text = pick(lines.oddWin);
  else if (isOdd && !playerWon)  text = pick(lines.oddLose);
  else if (!isOdd && playerWon)  text = pick(lines.evenWin);
  else                           text = pick(lines.evenLose);
  speak(text, LANG_CODES[language]);
}

export function announceHiding(language: GameLanguage) {
  speak(pick(VOICE_LINES[language].hiding), LANG_CODES[language]);
}

export function announceGuess(isOdd: boolean, language: GameLanguage) {
  const lines = VOICE_LINES[language];
  speak(isOdd ? pick(lines.guessOdd) : pick(lines.guessEven), LANG_CODES[language]);
}

// Keep these for backward compatibility
export function announceWin(_language: GameLanguage) {}
export function announceLose(_language: GameLanguage) {}
