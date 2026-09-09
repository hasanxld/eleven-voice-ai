import { useState } from "react";
import { CodeIcon } from "./Icons";

const endpoints = [
  {
    id: "tts",
    method: "POST",
    path: "/api/public/v1/tts",
    desc: "Turn text into speech with automatic emotion.",
    body: `{
  "text": "আজকের দিনটা দারুণ!",
  "voice_id": "EXAVITQu4vr4xnSDxMaL",
  "language": "bn",
  "auto_emotion": true,
  "format": "json"
}`,
    res: `{
  "success": true,
  "audio_base64": "//uQxAA...",
  "content_type": "audio/mpeg",
  "emotion": { "emotion": "happy", "confidence": 0.82 },
  "latency_ms": 1240
}`,
  },
  {
    id: "emotion",
    method: "POST",
    path: "/api/public/v1/emotion",
    desc: "Detect the emotion of any text and get tuned voice settings.",
    body: `{ "text": "I can't believe we finally did it!" }`,
    res: `{
  "success": true,
  "emotion": "excited",
  "confidence": 0.86,
  "voice_settings": { "stability": 0.25, "style": 0.8, "speed": 1.12 }
}`,
  },
  {
    id: "voices",
    method: "GET",
    path: "/api/public/v1/voices?language=hi",
    desc: "List every voice available for bn, en or hi.",
    body: "// no body",
    res: `{
  "success": true,
  "language": "hi",
  "count": 21,
  "voices": [{ "voice_id": "...", "name": "Sarah" }]
}`,
  },
];

export function ApiDocs() {
  const [active, setActive] = useState(endpoints[0]!.id);
  const current = endpoints.find((e) => e.id === active)!;

  return (
    <section id="api" className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl">
            The <span className="text-aurora">API</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Public, open source and CORS friendly. No API key required.
          </p>
        </div>

        <div className="glass-strong mt-10 rounded-3xl p-5 sm:p-7">
          <div className="flex flex-wrap gap-2">
            {endpoints.map((e) => (
              <button
                key={e.id}
                onClick={() => setActive(e.id)}
                className={`rounded-xl px-4 py-2 font-display text-xs tracking-wide transition ${
                  active === e.id ? "bg-aurora text-primary-foreground" : "glass text-muted-foreground"
                }`}
              >
                {e.method} {e.id}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="rounded-lg bg-secondary px-2.5 py-1 font-display text-xs">{current.method}</span>
            <code className="font-display text-sm break-all text-primary">{current.path}</code>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{current.desc}</p>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="glass rounded-2xl p-4">
              <p className="mb-2 flex items-center gap-2 text-xs tracking-widest text-muted-foreground uppercase">
                <CodeIcon className="h-4 w-4" /> Request
              </p>
              <pre className="overflow-x-auto font-display text-xs leading-relaxed text-foreground/90">
                {current.body}
              </pre>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="mb-2 text-xs tracking-widest text-muted-foreground uppercase">Response</p>
              <pre className="overflow-x-auto font-display text-xs leading-relaxed text-foreground/90">
                {current.res}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
