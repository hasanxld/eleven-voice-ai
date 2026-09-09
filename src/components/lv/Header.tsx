import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogoMark } from "./Icons";

const links = [
  { href: "#generator", label: "Generator" },
  { href: "#features", label: "Features" },
  { href: "#api", label: "API" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300 ${
          scrolled ? "glass-strong" : "glass"
        }`}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark className="h-9 w-9" />
          <span className="font-display text-lg tracking-wide">
            little<span className="text-aurora">voice</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-glass hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/auth"
            className="ml-2 rounded-xl bg-aurora px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
          >
            Dashboard
          </Link>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-border md:hidden"
        >
          <span className="flex flex-col gap-1.5">
            <span className={`h-0.5 w-5 bg-foreground transition ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 w-5 bg-foreground transition ${open ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-5 bg-foreground transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </nav>

      {open && (
        <div className="glass-strong mx-auto mt-2 max-w-6xl rounded-2xl p-3 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-3 text-sm text-muted-foreground hover:bg-glass hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/auth"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-xl bg-aurora px-3 py-3 text-center text-sm font-medium text-primary-foreground"
          >
            Dashboard Login
          </Link>
        </div>
      )}
    </header>
  );
}
