import { listDocs, addDoc, patchDoc } from "./firestore-rest.server";
import { analyzeEmotion, type EmotionResult } from "./emotion";

export const LANGUAGES = [
  { code: "bn", label: "Bangla", native: "বাংলা" },
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

export type LVVoice = {
  voice_id: string;
  name: string;
  category: string;
  languages: string[];
  preview_url: string | null;
  labels: Record<string, string>;
};

type KeyRecord = { id: string; key: string; label: string; active: boolean };

export async function loadKeyPool(): Promise<KeyRecord[]> {
  const docs = await listDocs("apiKeys");
  const pool = docs
    .map((d) => ({
      id: d.id,
      key: String(d.data["key"] ?? ""),
      label: String(d.data["label"] ?? "key"),
      active: d.data["active"] !== false,
    }))
    .filter((k) => k.active && k.key.length > 10);

  const envKey = process.env["ELEVENLABS_API_KEY"];
  if (envKey) pool.push({ id: "__connector__", key: envKey, label: "Connector key", active: true });
  return pool;
}

export function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

export async function logRequest(entry: {
  endpoint: string;
  status: "success" | "failed";
  key_label: string;
  latency_ms: number;
  message: string;
  language?: string;
  chars?: number;
}) {
  await addDoc("apiLogs", { ...entry, created_at: new Date().toISOString() });
}

async function bumpKeyUsage(id: string, ok: boolean) {
  if (id === "__connector__") return;
  const field = ok ? "success" : "failed";
  const docs = await listDocs("apiKeys");
  const found = docs.find((d) => d.id === id);
  const current = Number(found?.data[field] ?? 0);
  await patchDoc("apiKeys", id, { [field]: current + 1 });
}

const CACHE: { voices?: LVVoice[]; at: number } = { at: 0 };

function voiceLanguages(v: Record<string, unknown>): string[] {
  const set = new Set<string>();
  const verified = (v["verified_languages"] as Array<{ language?: string }> | undefined) ?? [];
  verified.forEach((l) => l?.language && set.add(String(l.language).toLowerCase().slice(0, 2)));
  const labels = (v["labels"] as Record<string, string> | undefined) ?? {};
  if (labels["language"]) set.add(String(labels["language"]).toLowerCase().slice(0, 2));
  const models = (v["high_quality_base_model_ids"] as string[] | undefined) ?? [];
  const multilingual =
    models.some((m) => m.includes("multilingual") || m.includes("v3")) ||
    String(v["category"] ?? "") === "premade";
  if (multilingual) {
    set.add("en");
    set.add("hi");
    set.add("bn");
  }
  return [...set];
}

export async function fetchVoices(apiKey: string): Promise<LVVoice[]> {
  if (CACHE.voices && Date.now() - CACHE.at < 10 * 60 * 1000) return CACHE.voices;

  const res = await fetch("https://api.elevenlabs.io/v2/voices?page_size=100", {
    headers: { "xi-api-key": apiKey },
  });
  if (!res.ok) throw new Error(`Voice list failed [${res.status}]: ${await res.text()}`);
  const json = (await res.json()) as { voices?: Array<Record<string, unknown>> };
  const voices: LVVoice[] = (json.voices ?? []).map((v) => ({
    voice_id: String(v["voice_id"]),
    name: String(v["name"] ?? "Voice"),
    category: String(v["category"] ?? "premade"),
    languages: voiceLanguages(v),
    preview_url: (v["preview_url"] as string | null) ?? null,
    labels: (v["labels"] as Record<string, string>) ?? {},
  }));
  CACHE.voices = voices;
  CACHE.at = Date.now();
  return voices;
}

export async function listVoicesForLanguage(language: LangCode): Promise<LVVoice[]> {
  const pool = await loadKeyPool();
  const key = pickRandom(pool);
  if (!key) throw new Error("No ElevenLabs API key available");
  const voices = await fetchVoices(key.key);
  return voices.filter((v) => v.languages.includes(language));
}

export type TtsOptions = {
  text: string;
  voice_id: string;
  language: LangCode;
  auto_emotion: boolean;
  model_id?: string;
  emotion_override?: string | null;
};

export type TtsResult = {
  audio_base64: string;
  content_type: string;
  emotion: EmotionResult | null;
  key_label: string;
  latency_ms: number;
  characters: number;
};

export async function synthesize(opts: TtsOptions): Promise<TtsResult> {
  const started = Date.now();
  const pool = await loadKeyPool();
  if (pool.length === 0) throw new Error("No ElevenLabs API key available");

  const emotion = opts.auto_emotion ? analyzeEmotion(opts.text) : null;
  const text = emotion ? emotion.styled_text : opts.text;
  const settings = emotion?.voice_settings ?? {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.3,
    use_speaker_boost: true,
    speed: 1,
  };

  // random key each request, retry with the remaining keys on failure
  const order = [...pool].sort(() => Math.random() - 0.5);
  let lastError = "unknown error";

  for (const key of order) {
    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${opts.voice_id}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: { "xi-api-key": key.key, "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            model_id: opts.model_id ?? "eleven_multilingual_v2",
            voice_settings: settings,
          }),
        },
      );

      if (!res.ok) {
        lastError = `[${res.status}] ${await res.text()}`;
        await bumpKeyUsage(key.id, false);
        continue;
      }

      const buffer = await res.arrayBuffer();
      const audio_base64 = Buffer.from(buffer).toString("base64");
      await bumpKeyUsage(key.id, true);
      const latency_ms = Date.now() - started;
      await logRequest({
        endpoint: "/api/public/v1/tts",
        status: "success",
        key_label: key.label,
        latency_ms,
        message: "ok",
        language: opts.language,
        chars: opts.text.length,
      });
      return {
        audio_base64,
        content_type: "audio/mpeg",
        emotion,
        key_label: key.label,
        latency_ms,
        characters: opts.text.length,
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  await logRequest({
    endpoint: "/api/public/v1/tts",
    status: "failed",
    key_label: "pool",
    latency_ms: Date.now() - started,
    message: lastError.slice(0, 300),
    language: opts.language,
    chars: opts.text.length,
  });
  throw new Error(`Speech generation failed: ${lastError}`);
}
