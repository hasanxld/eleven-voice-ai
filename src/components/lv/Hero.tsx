import { BoltIcon, GlobeIcon, SparkIcon } from "./Icons";

const stats = [
  { label: "Languages", value: "3" },
  { label: "Emotions", value: "8" },
  { label: "Open Source", value: "100%" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-32 pb-16 sm:pt-40 sm:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-aurora opacity-25 blur-[110px] animate-float"
      />
      <div className="relative mx-auto max-w-5xl text-center">
        <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs tracking-wide text-muted-foreground">
          <SparkIcon className="h-4 w-4 text-primary" />
          Open source voice API with auto emotion AI
        </span>

        <h1 className="mt-6 font-display text-4xl leading-tight tracking-tight sm:text-6xl md:text-7xl">
          Give your text a <span className="text-aurora">little voice</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          A free, public text-to-speech API powered by ElevenLabs voices — with an AI layer that reads
          the mood of your text and speaks it with the right emotion. Bangla, English and Hindi.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#generator"
            className="w-full rounded-2xl bg-aurora px-6 py-3.5 font-medium text-primary-foreground transition-transform hover:scale-[1.03] sm:w-auto"
          >
            Try the generator
          </a>
          <a
            href="#api"
            className="glass w-full rounded-2xl px-6 py-3.5 font-medium transition-colors hover:bg-glass-strong sm:w-auto"
          >
            Read API docs
          </a>
        </div>

        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-2xl px-3 py-5">
              <div className="font-display text-2xl text-aurora sm:text-3xl">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <BoltIcon className="h-4 w-4 text-primary" /> No signup for the public API
          </span>
          <span className="inline-flex items-center gap-2">
            <GlobeIcon className="h-4 w-4 text-accent" /> বাংলা · English · हिन्दी
          </span>
        </div>
      </div>
    </section>
  );
}
