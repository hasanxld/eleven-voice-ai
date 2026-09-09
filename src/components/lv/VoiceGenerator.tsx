import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { getVoices, generateSpeech, detectEmotion } from "@/lib/littlevoice.functions";
import type { EmotionResult } from "@/lib/emotion";
import { DownloadIcon, PlayIcon, SparkIcon, WaveIcon } from "./Icons";

type Lang = "bn" | "en" | "hi";

const LANGS: Array<{ code: Lang; label: string; native: string }> = [
  { code: "bn", label: "Bangla", native: "বাংলা" },
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
];

const SAMPLES: Record<Lang, string> = {
  bn: "আজকের দিনটা সত্যিই দারুণ! চলো নতুন কিছু বানাই।",
  en: "Wow, this is amazing! Let's build something incredible today.",
  hi: "वाह! आज का दिन कमाल का है, चलो कुछ नया बनाते हैं।",
};

const EMOJI: Record<string, string> = {
  neutral: "🎧",
  happy: "😄",
  sad: "😢",
  angry: "😠",
  excited: "🤩",
  calm: "😌",
  fear: "😨",
  romantic: "💗",
};

type Voice = { voice_id: string; name: string; labels: Record<string, string>; category: string };

export function VoiceGenerator() {
  const fetchVoices = useServerFn(getVoices);
  const speak = useServerFn(generateSpeech);
  const emotionFn = useServerFn(detectEmotion);

  const [language, setLanguage] = useState<Lang>("bn");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceId, setVoiceId] = useState("");
  const [text, setText] = useState(SAMPLES.bn);
  const [autoEmotion, setAutoEmotion] = useState(true);
  const [emotion, setEmotion] = useState<EmotionResult | null>(null);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [busy, setBusy] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingVoices(true);
    fetchVoices({ data: { language } })
      .then((res) => {
        if (cancelled) return;
        setVoices(res.voices as Voice[]);
        setVoiceId(res.voices[0]?.voice_id ?? "");
      })
      .catch((e: Error) => toast.error(e.message))
      .finally(() => !cancelled && setLoadingVoices(false));
    return () => {
      cancelled = true;
    };
  }, [language, fetchVoices]);

  useEffect(() => {
    if (!autoEmotion || text.trim().length < 3) {
      setEmotion(null);
      return;
    }
    const id = setTimeout(() => {
      emotionFn({ data: { text } })
        .then(setEmotion)
        .catch(() => undefined);
    }, 400);
    return () => clearTimeout(id);
  }, [text, autoEmotion, emotionFn]);

  const charCount = text.length;
  const charLimit = 2500;
  const currentVoice = useMemo(
    () => voices.find((v) => v.voice_id === voiceId),
    [voices, voiceId],
  );

  async function onGenerate() {
    if (!text.trim()) return toast.error("Write some text first");
    if (!voiceId) return toast.error("Pick a voice first");
    setBusy(true);
    try {
      const res = await speak({
        data: { text: text.slice(0, charLimit), voice_id: voiceId, language, auto_emotion: autoEmotion },
      });
      const url = `data:audio/mpeg;base64,${res.audio_base64}`;
      setAudioUrl(url);
      setEmotion(res.emotion);
      setTimeout(() => audioRef.current?.play().catch(() => undefined), 60);
      toast.success(`Voice ready in ${res.latency_ms} ms`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="generator" className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl">
            Voice <span className="text-aurora">Generator</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Powered by the live Little Voice API. Choose a language, pick a voice and let the emotion
            engine do the acting.
          </p>
        </div>

        <div className="glass-strong mt-10 grid gap-6 rounded-3xl p-5 sm:p-7 lg:grid-cols-[1.35fr_1fr]">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setText(SAMPLES[l.code]);
                    setAudioUrl(null);
                  }}
                  className={`rounded-xl px-4 py-2 text-sm transition-all ${
                    language === l.code
                      ? "bg-aurora text-primary-foreground"
                      : "glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.native}
                </button>
              ))}
            </div>

            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, charLimit))}
                rows={7}
                placeholder="Type or paste your text here..."
                className="w-full resize-none rounded-2xl border border-border bg-input/40 p-4 text-base outline-none transition focus:glow-ring"
              />
              <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                {charCount}/{charLimit}
              </span>
            </div>

            <div className="glass flex items-center justify-between rounded-2xl px-4 py-3">
              <div className="flex items-center gap-3">
                <SparkIcon className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm">Auto emotion AI</p>
                  <p className="text-xs text-muted-foreground">Reads mood and tunes the delivery</p>
                </div>
              </div>
              <button
                role="switch"
                aria-checked={autoEmotion}
                onClick={() => setAutoEmotion((v) => !v)}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  autoEmotion ? "bg-aurora" : "bg-secondary"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-background transition-all ${
                    autoEmotion ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onGenerate}
                disabled={busy}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-aurora px-6 py-3.5 font-medium text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                    Generating…
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-5 w-5" /> Generate voice
                  </>
                )}
              </button>
              {audioUrl && (
                <a
                  href={audioUrl}
                  download="little-voice.mp3"
                  className="glass inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 font-medium hover:bg-glass-strong"
                >
                  <DownloadIcon className="h-5 w-5" /> Download
                </a>
              )}
            </div>

            {audioUrl && (
              <div className="glass rounded-2xl p-4">
                <audio ref={audioRef} src={audioUrl} controls className="w-full" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                <WaveIcon className="h-5 w-5 text-primary" />
                {loadingVoices
                  ? "Loading voices…"
                  : `${voices.length} voices for ${LANGS.find((l) => l.code === language)?.label}`}
              </div>
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {voices.map((v) => (
                  <button
                    key={v.voice_id}
                    onClick={() => setVoiceId(v.voice_id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
                      voiceId === v.voice_id ? "glass-strong glow-ring" : "hover:bg-glass"
                    }`}
                  >
                    <span className="text-sm">{v.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {v.labels["gender"] ?? v.category}
                    </span>
                  </button>
                ))}
                {!loadingVoices && voices.length === 0 && (
                  <p className="text-sm text-muted-foreground">No voices found for this language.</p>
                )}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <p className="text-xs tracking-widest text-muted-foreground uppercase">Detected emotion</p>
              {emotion ? (
                <>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-3xl">{EMOJI[emotion.emotion] ?? "🎧"}</span>
                    <div>
                      <p className="font-display text-xl capitalize">{emotion.emotion}</p>
                      <p className="text-xs text-muted-foreground">
                        confidence {Math.round(emotion.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                    {(
                      [
                        ["stability", emotion.voice_settings.stability],
                        ["style", emotion.voice_settings.style],
                        ["speed", emotion.voice_settings.speed],
                      ] as const
                    ).map(([k, v]) => (
                      <div key={k}>
                        <div className="flex justify-between">
                          <span>{k}</span>
                          <span>{v}</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-aurora"
                            style={{ width: `${Math.min(100, Number(v) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  {autoEmotion ? "Start typing to analyse the mood." : "Auto emotion is off."}
                </p>
              )}
            </div>

            {currentVoice && (
              <p className="text-center text-xs text-muted-foreground">
                Using <span className="text-foreground">{currentVoice.name}</span> · model
                eleven_multilingual_v2
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
