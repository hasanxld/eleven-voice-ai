import { BoltIcon, ChartIcon, CodeIcon, GlobeIcon, HeartIcon, KeyIcon, ShieldIcon, SparkIcon } from "./Icons";

const features = [
  {
    icon: SparkIcon,
    title: "Auto Emotion AI",
    body: "Every request is scanned for mood — happy, sad, angry, excited, calm, fear or romantic — and the voice settings adapt automatically.",
  },
  {
    icon: GlobeIcon,
    title: "3 Languages, Real Voices",
    body: "Curated Bangla, English and Hindi voices straight from the ElevenLabs catalogue, filtered per language.",
  },
  {
    icon: KeyIcon,
    title: "Multi-Key Rotation",
    body: "The API pool picks a random key per request and instantly fails over to another key when one is rate limited.",
  },
  {
    icon: BoltIcon,
    title: "Fast MP3 Output",
    body: "44.1kHz 128kbps MP3 returned as base64 or raw audio — ready to play in the browser or save to disk.",
  },
  {
    icon: ChartIcon,
    title: "Live Analytics",
    body: "Total requests, success rate, failures and per-request logs tracked in the private dashboard.",
  },
  {
    icon: ShieldIcon,
    title: "Private Admin Area",
    body: "Username and password login backed by Firebase Firestore keeps keys and logs behind the dashboard.",
  },
  {
    icon: CodeIcon,
    title: "Simple REST",
    body: "Two endpoints, JSON in, JSON out, CORS open. Works from any language or runtime.",
  },
  {
    icon: HeartIcon,
    title: "Free & Open Source",
    body: "No signup, no billing wall for the public API. Build bots, readers, learning apps and more.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl">
            Built like a <span className="text-aurora">real platform</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Everything you need to ship speech features without touching provider plumbing.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass group rounded-3xl p-5 transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="glass-strong grid h-11 w-11 place-items-center rounded-2xl text-primary transition-colors group-hover:text-accent">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
