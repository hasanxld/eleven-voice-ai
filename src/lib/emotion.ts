export type EmotionName =
  | "neutral"
  | "happy"
  | "sad"
  | "angry"
  | "excited"
  | "calm"
  | "fear"
  | "romantic";

export type EmotionResult = {
  emotion: EmotionName;
  confidence: number;
  intensity: number;
  scores: Record<string, number>;
  voice_settings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
    speed: number;
  };
  styled_text: string;
};

const LEXICON: Record<EmotionName, string[]> = {
  happy: [
    "happy","joy","glad","great","awesome","wonderful","love it","smile","haha","lol","congrats","nice",
    "খুশি","আনন্দ","দারুণ","ভালো","চমৎকার","হাসি","অভিনন্দন","মজা",
    "खुश","आनंद","बढ़िया","शानदार","मज़ा","बहुत अच्छा",
  ],
  sad: [
    "sad","sorry","unfortunately","cry","miss you","alone","hurt","lost","depressed","pain",
    "দুঃখ","কষ্ট","কাঁদ","একা","বিষণ্ণ","হারিয়ে","ব্যথা",
    "दुख","उदास","अकेला","रोना","दर्द",
  ],
  angry: [
    "angry","hate","stupid","furious","idiot","worst","annoying","shut up","damn",
    "রাগ","বিরক্ত","ঘৃণা","বাজে","চুপ","খারাপ",
    "गुस्सा","नफरत","बकवास","चुप","बेवकूफ",
  ],
  excited: [
    "wow","amazing","incredible","let's go","finally","huge","launch","breaking","unbelievable","!!!",
    "ওয়াও","অসাধারণ","দুর্দান্ত","অবিশ্বাস্য","চলো","অবশেষে",
    "वाह","कमाल","अविश्वसनीय","चलो","आखिरकार",
  ],
  calm: [
    "relax","calm","breathe","slowly","peace","gentle","meditate","quiet",
    "শান্ত","ধীরে","নিরিবিলি","আরাম","শান্তি",
    "शांत","धीरे","आराम","सुकून",
  ],
  fear: [
    "afraid","scared","danger","warning","help","terrified","panic","emergency",
    "ভয়","বিপদ","সাবধান","সাহায্য","আতঙ্ক",
    "डर","खतरा","सावधान","मदद","घबरा",
  ],
  romantic: [
    "love you","darling","sweetheart","forever","heart","dear","kiss",
    "ভালোবাসি","প্রিয়","হৃদয়","আদর",
    "प्यार","दिल","जान","महबूब",
  ],
  neutral: [],
};

const PROFILES: Record<EmotionName, EmotionResult["voice_settings"]> = {
  neutral: { stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true, speed: 1.0 },
  happy: { stability: 0.38, similarity_boost: 0.8, style: 0.55, use_speaker_boost: true, speed: 1.05 },
  sad: { stability: 0.7, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true, speed: 0.9 },
  angry: { stability: 0.28, similarity_boost: 0.75, style: 0.75, use_speaker_boost: true, speed: 1.08 },
  excited: { stability: 0.25, similarity_boost: 0.8, style: 0.8, use_speaker_boost: true, speed: 1.12 },
  calm: { stability: 0.8, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true, speed: 0.92 },
  fear: { stability: 0.35, similarity_boost: 0.8, style: 0.6, use_speaker_boost: true, speed: 1.06 },
  romantic: { stability: 0.6, similarity_boost: 0.85, style: 0.5, use_speaker_boost: true, speed: 0.95 },
};

function styleText(text: string, emotion: EmotionName): string {
  const t = text.trim();
  switch (emotion) {
    case "sad":
    case "calm":
      return t.replace(/([।.!?])\s+/g, "$1 ... ");
    case "excited":
      return t.replace(/([।.])(\s|$)/g, "!$2");
    default:
      return t;
  }
}

export function analyzeEmotion(text: string): EmotionResult {
  const lower = text.toLowerCase();
  const scores: Record<string, number> = {};
  let total = 0;

  (Object.keys(LEXICON) as EmotionName[]).forEach((emotion) => {
    let score = 0;
    for (const word of LEXICON[emotion]) {
      if (lower.includes(word.toLowerCase())) score += 1;
    }
    scores[emotion] = score;
    total += score;
  });

  const exclaim = (text.match(/!/g) || []).length;
  const question = (text.match(/[?？]/g) || []).length;
  const caps = (text.match(/\b[A-Z]{3,}\b/g) || []).length;
  scores["excited"] = (scores["excited"] ?? 0) + Math.min(exclaim, 4) * 0.8 + caps * 0.6;
  scores["calm"] = (scores["calm"] ?? 0) + (question > 0 && exclaim === 0 ? 0.4 : 0);
  total += Math.min(exclaim, 4) * 0.8 + caps * 0.6;

  let best: EmotionName = "neutral";
  let bestScore = 0;
  (Object.keys(scores) as EmotionName[]).forEach((k) => {
    if (scores[k]! > bestScore) {
      bestScore = scores[k]!;
      best = k;
    }
  });

  const confidence = total > 0 ? Math.min(0.98, 0.45 + bestScore / (total + 1)) : 0.4;
  const intensity = Math.min(1, bestScore / 3);
  const base = PROFILES[best];
  const settings = {
    ...base,
    style: Math.min(1, Number((base.style + intensity * 0.15).toFixed(2))),
  };

  return {
    emotion: bestScore === 0 ? "neutral" : best,
    confidence: Number(confidence.toFixed(2)),
    intensity: Number(intensity.toFixed(2)),
    scores,
    voice_settings: settings,
    styled_text: styleText(text, bestScore === 0 ? "neutral" : best),
  };
}
