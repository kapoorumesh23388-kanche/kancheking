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
    oddWin:   ["à¤¬à¤§à¤¾à¤ˆ à¤¹à¥‹! à¤•à¤²à¥€ à¤¹à¥ˆ, à¤¤à¥à¤® à¤œà¥€à¤¤ à¤—à¤!", "à¤•à¤²à¥€ à¤¹à¥ˆ! à¤¶à¤¾à¤¬à¤¾à¤¶, à¤œà¥€à¤¤ à¤—à¤!", "à¤•à¤²à¥€ à¤¨à¤¿à¤•à¤²à¥€, à¤¤à¥à¤® à¤œà¥€à¤¤ à¤—à¤! à¤µà¤¾à¤¹!"],
    oddLose:  ["à¤•à¤²à¥€ à¤¹à¥ˆ, à¤¤à¥à¤® à¤¹à¤¾à¤° à¤—à¤!", "à¤¹à¤¾à¤¯! à¤•à¤²à¥€ à¤¥à¥€, à¤…à¤—à¤²à¥€ à¤¬à¤¾à¤° à¤œà¥€à¤¤à¤¨à¤¾!", "à¤•à¤²à¥€ à¤¨à¤¿à¤•à¤²à¥€, à¤¹à¤¾à¤° à¤—à¤!"],
    evenWin:  ["à¤¬à¤§à¤¾à¤ˆ à¤¹à¥‹! à¤œà¥‹à¤Ÿà¥à¤Ÿà¤¾ à¤¹à¥ˆ, à¤¤à¥à¤® à¤œà¥€à¤¤ à¤—à¤!", "à¤œà¥‹à¤Ÿà¥à¤Ÿà¤¾ à¤¹à¥ˆ! à¤¶à¤¾à¤¬à¤¾à¤¶!", "à¤œà¥‹à¤Ÿà¥à¤Ÿà¤¾ à¤¨à¤¿à¤•à¤²à¤¾, à¤¤à¥à¤® à¤œà¥€à¤¤ à¤—à¤!"],
    evenLose: ["à¤œà¥‹à¤Ÿà¥à¤Ÿà¤¾ à¤¹à¥ˆ, à¤¤à¥à¤® à¤¹à¤¾à¤° à¤—à¤!", "à¤œà¥‹à¤Ÿà¥à¤Ÿà¤¾ à¤¥à¤¾, à¤¹à¤¾à¤° à¤—à¤! à¤…à¤—à¤²à¥€ à¤¬à¤¾à¤°!", "à¤œà¥‹à¤Ÿà¥à¤Ÿà¤¾ à¤¨à¤¿à¤•à¤²à¤¾, à¤¹à¤¾à¤° à¤—à¤!"],
    hiding:   ["à¤®à¥à¤Ÿà¥à¤ à¥€ à¤¬à¤‚à¤¦ à¤•à¤°à¥‹!", "à¤›à¥à¤ªà¤¾à¤“ à¤•à¤¾à¤‚à¤šà¥‡!", "à¤¦à¥‡à¤–à¤¨à¥‡ à¤®à¤¤ à¤¦à¥‡à¤¨à¤¾!"],
    guessOdd: ["à¤•à¤²à¥€! à¤®à¥‡à¤°à¤¾ à¤¦à¤¾à¤‚à¤µ à¤•à¤²à¥€ à¤ªà¤°!", "à¤•à¤²à¥€ à¤²à¤—à¤¾à¤ˆ!", "à¤µà¤¿à¤·à¤® â€” à¤•à¤²à¥€ à¤¬à¥‹à¤²à¤¾!"],
    guessEven:["à¤œà¥‹à¤Ÿà¥à¤Ÿà¤¾! à¤®à¥‡à¤°à¤¾ à¤¦à¤¾à¤‚à¤µ à¤œà¥‹à¤Ÿà¥à¤Ÿà¤¾ à¤ªà¤°!", "à¤œà¥‹à¤Ÿà¥à¤Ÿà¤¾ à¤²à¤—à¤¾à¤¯à¤¾!", "à¤¸à¤® â€” à¤œà¥‹à¤Ÿà¥à¤Ÿà¤¾ à¤¬à¥‹à¤²à¤¾!"],
  },
  en: {
    oddWin:   ["Kali! You win! Congratulations!", "It's Kali â€” odd! You won!", "Kali hai â€” you win!"],
    oddLose:  ["Kali! Odd â€” you lose!", "It's Kali, better luck next time!", "Kali hai â€” you lost!"],
    evenWin:  ["Jotta! Even â€” you win!", "It's Jotta â€” you won! Well done!", "Jotta hai â€” you win!"],
    evenLose: ["Jotta! Even â€” you lose!", "It's Jotta, better luck next time!", "Jotta hai â€” you lost!"],
    hiding:   ["Hide your marbles!", "Close your fist!", "Don't let them see!"],
    guessOdd: ["I guess Kali â€” odd!", "My bet is Kali!", "Going with Kali!"],
    guessEven:["I guess Jotta â€” even!", "My bet is Jotta!", "Going with Jotta!"],
  },
  ta: {
    oddWin:   ["à®µà®¾à®´à¯à®¤à¯à®¤à¯à®•à¯à®•à®³à¯! à®•à®²à®¿ â€” à®¨à¯€à®™à¯à®•à®³à¯ à®µà¯†à®©à¯à®±à¯€à®°à¯à®•à®³à¯!"],
    oddLose:  ["à®•à®²à®¿ â€” à®¨à¯€à®™à¯à®•à®³à¯ à®¤à¯‹à®±à¯à®±à¯€à®°à¯à®•à®³à¯!"],
    evenWin:  ["à®µà®¾à®´à¯à®¤à¯à®¤à¯à®•à¯à®•à®³à¯! à®œà¯‹à®Ÿà¯à®Ÿà®¾ â€” à®¨à¯€à®™à¯à®•à®³à¯ à®µà¯†à®©à¯à®±à¯€à®°à¯à®•à®³à¯!"],
    evenLose: ["à®œà¯‹à®Ÿà¯à®Ÿà®¾ â€” à®¨à¯€à®™à¯à®•à®³à¯ à®¤à¯‹à®±à¯à®±à¯€à®°à¯à®•à®³à¯!"],
    hiding:   ["à®®à®±à¯ˆà®¤à¯à®¤à¯à®•à¯à®•à¯Šà®³à¯à®³à¯à®™à¯à®•à®³à¯!"],
    guessOdd: ["à®•à®²à®¿ à®Žà®©à¯à®±à¯ à®šà¯Šà®²à¯à®•à®¿à®±à¯‡à®©à¯!"],
    guessEven:["à®œà¯‹à®Ÿà¯à®Ÿà®¾ à®Žà®©à¯à®±à¯ à®šà¯Šà®²à¯à®•à®¿à®±à¯‡à®©à¯!"],
  },
  te: {
    oddWin:   ["à°…à°­à°¿à°¨à°‚à°¦à°¨à°²à±! à°•à°²à°¿ â€” à°®à±€à°°à± à°—à±†à°²à°¿à°šà°¾à°°à±!"],
    oddLose:  ["à°•à°²à°¿ â€” à°®à±€à°°à± à°“à°¡à°¿à°ªà±‹à°¯à°¾à°°à±!"],
    evenWin:  ["à°…à°­à°¿à°¨à°‚à°¦à°¨à°²à±! à°œà±‹à°Ÿà±à°Ÿà°¾ â€” à°®à±€à°°à± à°—à±†à°²à°¿à°šà°¾à°°à±!"],
    evenLose: ["à°œà±‹à°Ÿà±à°Ÿà°¾ â€” à°®à±€à°°à± à°“à°¡à°¿à°ªà±‹à°¯à°¾à°°à±!"],
    hiding:   ["à°¦à°¾à°šà°‚à°¡à°¿!"],
    guessOdd: ["à°•à°²à°¿ à°…à°‚à°Ÿà±à°¨à±à°¨à°¾à°¨à±!"],
    guessEven:["à°œà±‹à°Ÿà±à°Ÿà°¾ à°…à°‚à°Ÿà±à°¨à±à°¨à°¾à°¨à±!"],
  },
  kn: {
    oddWin:   ["à²…à²­à²¿à²¨à²‚à²¦à²¨à³†à²—à²³à³! à²•à²²à²¿ â€” à²¨à³€à²µà³ à²—à³†à²¦à³à²¦à²¿à²°à²¿!"],
    oddLose:  ["à²•à²²à²¿ â€” à²¨à³€à²µà³ à²¸à³‹à²¤à²¿à²°à²¿!"],
    evenWin:  ["à²…à²­à²¿à²¨à²‚à²¦à²¨à³†à²—à²³à³! à²œà³‹à²Ÿà³à²Ÿà²¾ â€” à²¨à³€à²µà³ à²—à³†à²¦à³à²¦à²¿à²°à²¿!"],
    evenLose: ["à²œà³‹à²Ÿà³à²Ÿà²¾ â€” à²¨à³€à²µà³ à²¸à³‹à²¤à²¿à²°à²¿!"],
    hiding:   ["à²…à²¡à²—à²¿à²¸à²¿!"],
    guessOdd: ["à²•à²²à²¿ à²Žà²¨à³à²¨à³à²¤à³à²¤à³‡à²¨à³†!"],
    guessEven:["à²œà³‹à²Ÿà³à²Ÿà²¾ à²Žà²¨à³à²¨à³à²¤à³à²¤à³‡à²¨à³†!"],
  },
  ml: {
    oddWin:   ["à´…à´­à´¿à´¨à´¨àµà´¦à´¨à´™àµà´™àµ¾! à´•à´²à´¿ â€” à´¨à´¿à´™àµà´™àµ¾ à´œà´¯à´¿à´šàµà´šàµ!"],
    oddLose:  ["à´•à´²à´¿ â€” à´¨à´¿à´™àµà´™àµ¾ à´¤àµ‹à´±àµà´±àµ!"],
    evenWin:  ["à´…à´­à´¿à´¨à´¨àµà´¦à´¨à´™àµà´™àµ¾! à´œàµ‹à´Ÿàµà´Ÿà´¾ â€” à´¨à´¿à´™àµà´™àµ¾ à´œà´¯à´¿à´šàµà´šàµ!"],
    evenLose: ["à´œàµ‹à´Ÿàµà´Ÿà´¾ â€” à´¨à´¿à´™àµà´™àµ¾ à´¤àµ‹à´±àµà´±àµ!"],
    hiding:   ["à´’à´³à´¿à´ªàµà´ªà´¿à´•àµà´•àµ‚!"],
    guessOdd: ["à´•à´²à´¿ à´Žà´¨àµà´¨àµ à´žà´¾àµ» à´ªà´±à´¯àµà´¨àµà´¨àµ!"],
    guessEven:["à´œàµ‹à´Ÿàµà´Ÿà´¾ à´Žà´¨àµà´¨àµ à´žà´¾àµ» à´ªà´±à´¯àµà´¨àµà´¨àµ!"],
  },
  bn: {
    oddWin:   ["à¦…à¦­à¦¿à¦¨à¦¨à§à¦¦à¦¨! à¦•à¦¾à¦²à¦¿ â€” à¦¤à§à¦®à¦¿ à¦œà¦¿à¦¤à§‡à¦›!"],
    oddLose:  ["à¦•à¦¾à¦²à¦¿ â€” à¦¤à§à¦®à¦¿ à¦¹à§‡à¦°à§‡à¦›!"],
    evenWin:  ["à¦…à¦­à¦¿à¦¨à¦¨à§à¦¦à¦¨! à¦œà§‹à¦Ÿà§à¦Ÿà¦¾ â€” à¦¤à§à¦®à¦¿ à¦œà¦¿à¦¤à§‡à¦›!"],
    evenLose: ["à¦œà§‹à¦Ÿà§à¦Ÿà¦¾ â€” à¦¤à§à¦®à¦¿ à¦¹à§‡à¦°à§‡à¦›!"],
    hiding:   ["à¦²à§à¦•à¦¿à¦¯à¦¼à§‡ à¦«à§‡à¦²à§‹!"],
    guessOdd: ["à¦•à¦¾à¦²à¦¿ à¦¬à¦²à¦›à¦¿!"],
    guessEven:["à¦œà§‹à¦Ÿà§à¦Ÿà¦¾ à¦¬à¦²à¦›à¦¿!"],
  },
  mr: {
    oddWin:   ["à¤…à¤­à¤¿à¤¨à¤‚à¤¦à¤¨! à¤•à¤¾à¤³à¥€ â€” à¤¤à¥à¤®à¥à¤¹à¥€ à¤œà¤¿à¤‚à¤•à¤²à¤¾à¤¤!"],
    oddLose:  ["à¤•à¤¾à¤³à¥€ â€” à¤¤à¥à¤®à¥à¤¹à¥€ à¤¹à¤°à¤²à¤¾à¤¤!"],
    evenWin:  ["à¤…à¤­à¤¿à¤¨à¤‚à¤¦à¤¨! à¤œà¥‹à¤Ÿà¥à¤Ÿà¤¾ â€” à¤¤à¥à¤®à¥à¤¹à¥€ à¤œà¤¿à¤‚à¤•à¤²à¤¾à¤¤!"],
    evenLose: ["à¤œà¥‹à¤Ÿà¥à¤Ÿà¤¾ â€” à¤¤à¥à¤®à¥à¤¹à¥€ à¤¹à¤°à¤²à¤¾à¤¤!"],
    hiding:   ["à¤²à¤ªà¤µà¤¾!"],
    guessOdd: ["à¤•à¤¾à¤³à¥€ à¤®à¥à¤¹à¤£à¤¤à¥‹!"],
    guessEven:["à¤œà¥‹à¤Ÿà¥à¤Ÿà¤¾ à¤®à¥à¤¹à¤£à¤¤à¥‹!"],
  },
  gu: {
    oddWin:   ["àª…àª­àª¿àª¨àª‚àª¦àª¨! àª•àª³à«€ â€” àª¤àª®à«‡ àªœà«€àª¤à«àª¯àª¾!"],
    oddLose:  ["àª•àª³à«€ â€” àª¤àª®à«‡ àª¹àª¾àª°à«àª¯àª¾!"],
    evenWin:  ["àª…àª­àª¿àª¨àª‚àª¦àª¨! àªœà«‹àªŸà«àªŸàª¾ â€” àª¤àª®à«‡ àªœà«€àª¤à«àª¯àª¾!"],
    evenLose: ["àªœà«‹àªŸà«àªŸàª¾ â€” àª¤àª®à«‡ àª¹àª¾àª°à«àª¯àª¾!"],
    hiding:   ["àª›à«àªªàª¾àªµà«‹!"],
    guessOdd: ["àª•àª³à«€ àª•àª¹à«àª‚ àª›à«àª‚!"],
    guessEven:["àªœà«‹àªŸà«àªŸàª¾ àª•àª¹à«àª‚ àª›à«àª‚!"],
  },
};

export const LANGUAGE_NAMES: Record<GameLanguage, string> = {
  hi: "à¤¹à¤¿à¤‚à¤¦à¥€", en: "English", ta: "à®¤à®®à®¿à®´à¯", te: "à°¤à±†à°²à±à°—à±",
  kn: "à²•à²¨à³à²¨à²¡", ml: "à´®à´²à´¯à´¾à´³à´‚", bn: "à¦¬à¦¾à¦‚à¦²à¦¾", mr: "à¤®à¤°à¤¾à¤ à¥€", gu: "àª—à«àªœàª°àª¾àª¤à«€",
};

const LANG_CODES: Record<GameLanguage, string> = {
  hi: "hi-IN", en: "en-IN", ta: "ta-IN", te: "te-IN",
  kn: "kn-IN", ml: "ml-IN", bn: "bn-IN", mr: "mr-IN", gu: "gu-IN",
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isAndroidWebView(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  return ua.includes("Android") && (ua.includes("wv") || ua.includes("WebView"));
}

// Voices preload on module load.
// Wrapped in try/catch: on some Capacitor/Android WebView builds,
// touching speechSynthesis at module-load time can throw synchronously,
// which would otherwise crash this entire module's import and break
// every caller (including result SFX) - not just the voice feature.
let speechSynthesisSupported = false;
try {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      try { window.speechSynthesis.getVoices(); } catch {}
    };
    speechSynthesisSupported = true;
  }
} catch (e) {
  console.warn("speechSynthesis unavailable on this device:", e);
  speechSynthesisSupported = false;
}

// Callback registry so GamePlay can mute/unmute SFX around voice
type VoidFn = () => void;
let onSpeakStart: VoidFn | null = null;
let onSpeakEnd: VoidFn | null = null;

export function setSpeakCallbacks(onStart: VoidFn, onEnd: VoidFn) {
  onSpeakStart = onStart;
  onSpeakEnd = onEnd;
}

function speakWithRetry(text: string, lang: string, retries = 4) {
  // Always notify GamePlay first, with its own safety net, BEFORE
  // touching speechSynthesis at all. This guarantees SFX gets unmuted
  // even if speechSynthesis access itself throws synchronously below
  // (seen on some Capacitor/Android WebView builds).
  if (onSpeakStart) onSpeakStart();
  let endCalled = false;
  const callEndOnce = () => {
    if (endCalled) return;
    endCalled = true;
    if (onSpeakEnd) onSpeakEnd();
  };
  const safetyNetMs = isAndroidWebView() ? 1800 : 6000;
  const safetyTimer = setTimeout(callEndOnce, safetyNetMs);

  if (!speechSynthesisSupported || typeof window === "undefined" || !("speechSynthesis" in window)) {
    clearTimeout(safetyTimer);
    callEndOnce();
    return;
  }

  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    console.warn("speechSynthesis.cancel() threw:", e);
    clearTimeout(safetyTimer);
    callEndOnce();
    return;
  }

  let attempted = 0;
  // Android WebView speechSynthesis is unreliable on many builds (silently
  // does nothing, no onstart/onerror at all). Don't burn multiple retries
  // and multi-second timeouts here - try once quickly, and let the safety
  // net above unmute SFX fast if it's truly broken on this device.
  const maxAttempts = isAndroidWebView() ? 1 : retries;

  const attempt = () => {
    attempted++;

    let utter: SpeechSynthesisUtterance;
    try {
      utter = new SpeechSynthesisUtterance(text);
    } catch (e) {
      console.warn("Failed to create SpeechSynthesisUtterance:", e);
      clearTimeout(safetyTimer);
      callEndOnce();
      return;
    }
    utter.lang = lang;
    utter.rate = 0.85;
    utter.pitch = 1.0;
    utter.volume = 1.0;

    if (!isAndroidWebView()) {
      const voices = window.speechSynthesis.getVoices();
      const langCode = lang.split("-")[0];
      const voice =
        voices.find(v => v.lang === lang && v.name.toLowerCase().includes("india")) ||
        voices.find(v => v.lang === lang) ||
        voices.find(v => v.lang.startsWith(langCode));
      if (voice) utter.voice = voice;
    }

    utter.onend = () => {
      clearTimeout(safetyTimer);
      callEndOnce();
    };

    utter.onerror = (e) => {
      console.warn("TTS error:", e.error, "attempt:", attempted);
      if (attempted < maxAttempts) {
        setTimeout(attempt, 300);
      } else {
        clearTimeout(safetyTimer);
        callEndOnce();
      }
    };

    try {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn("TTS speak() threw:", e);
      if (attempted < maxAttempts) setTimeout(attempt, 300);
      else { clearTimeout(safetyTimer); callEndOnce(); }
    }
  };

  // Wait for voices to be available
  try {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      attempt();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        attempt();
      };
      // Fallback if onvoiceschanged never fires
      setTimeout(() => {
        try {
          if (!window.speechSynthesis.speaking) attempt();
        } catch (e) {
          console.warn("speechSynthesis.speaking check threw:", e);
          clearTimeout(safetyTimer);
          callEndOnce();
        }
      }, 600);
    }
  } catch (e) {
    console.warn("getVoices() threw:", e);
    clearTimeout(safetyTimer);
    callEndOnce();
  }
}

function speak(text: string, lang: string) {
  speakWithRetry(text, lang, 4);
}

export function announceResult(isOdd: boolean, playerWon: boolean, language: GameLanguage) {
  const lines = VOICE_LINES[language];
  let text: string;
  if (isOdd && playerWon)        text = pick(lines.oddWin);
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

export function announceWin(_language: GameLanguage) {}
export function announceLose(_language: GameLanguage) {}


