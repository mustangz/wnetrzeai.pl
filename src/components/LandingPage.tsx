"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BeforeAfter from "@/components/BeforeAfter";

// A/B/C pricing variants
const pricingVariants = {
  A: { starter: 59, pro: 149, agency: 349 },
  B: { starter: 79, pro: 179, agency: 449 },
  C: { starter: 99, pro: 249, agency: 549 },
} as const;

type Variant = keyof typeof pricingVariants;

function getVariant(): Variant {
  if (typeof window === "undefined") return "A";
  const urlParams = new URLSearchParams(window.location.search);
  const urlVariant = urlParams.get("v")?.toUpperCase() as Variant | undefined;
  if (urlVariant && ["A", "B", "C"].includes(urlVariant)) {
    localStorage.setItem("wnetrzeai_variant", urlVariant);
    return urlVariant;
  }
  let variant = localStorage.getItem("wnetrzeai_variant") as Variant | null;
  if (!variant) {
    const variants: Variant[] = ["A", "B", "C"];
    variant = variants[Math.floor(Math.random() * variants.length)];
    localStorage.setItem("wnetrzeai_variant", variant);
  }
  return variant;
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function LandingPage({ defaultTheme = "dark" }: { defaultTheme?: "dark" | "light" }) {
  const [variant, setVariant] = useState<Variant>("A");
  const [isYearly, setIsYearly] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);
  const [modal, setModal] = useState<{ plan: string; price: number } | null>(null);
  const [modalState, setModalState] = useState<"form" | "loading" | "success">("form");
  const [theme, setTheme] = useState<"dark" | "light">(defaultTheme);

  useEffect(() => {
    setVariant(getVariant());
    const saved = localStorage.getItem("wnetrzeai_theme") as "dark" | "light" | null;
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("wnetrzeai_theme", next);
  };

  const isLight = theme === "light";

  const prices = pricingVariants[variant];
  const multiplier = isYearly ? 1 : 1.25;

  const getPrice = (base: number) => Math.round(base * multiplier);

  const openCheckout = (plan: string, basePrice: number) => {
    setModal({ plan, price: getPrice(basePrice) });
    setModalState("form");
  };

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModalState("loading");
    const formData = new FormData(e.currentTarget);
    formData.append("_subject", `Nowe zamówienie WnetrzeAI - ${formData.get("plan")}`);
    formData.append("variant", variant);
    await new Promise((r) => setTimeout(r, 2000));
    try {
      await fetch("https://formspree.io/f/xyzyvvpp", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
    } catch {}
    setModalState("success");
    setTimeout(() => setModal(null), 3000);
  };

  const faqs = [
    {
      q: "Czy virtual staging jest legalny?",
      a: 'Tak, virtual staging jest całkowicie legalny i powszechnie stosowany na rynku nieruchomości. Ważne jest jedynie oznaczenie zdjęć jako "wizualizacja" lub "virtual staging" w ogłoszeniu, co jest standardową praktyką w branży.',
    },
    {
      q: "Jak realistyczne są efekty?",
      a: "Bardzo realistyczne. Używamy najnowszych modeli AI trenowanych na milionach profesjonalnych zdjęć wnętrz. Meble i dekoracje wyglądają naturalnie, z prawidłowymi cieniami i perspektywą. Zachowujemy układ pomieszczenia, okna i drzwi.",
    },
    {
      q: "Jakie zdjęcia są najlepsze do stagingu?",
      a: "Najlepiej działają zdjęcia zrobione prosto naprzeciwko ściany (nie pod kątem), w dobrym świetle naturalnym, z pustym i posprzątanym pomieszczeniem. Minimalna rozdzielczość to 1920x1080px.",
    },
    {
      q: "Ile trwa generowanie zdjęcia?",
      a: "Średnio 30 sekund. W godzinach szczytu może to być do 2 minut. Otrzymasz powiadomienie email gdy zdjęcie będzie gotowe do pobrania.",
    },
    {
      q: "Czy mogę przetestować za darmo?",
      a: "Tak! Pierwszy render jest całkowicie darmowy, bez podawania karty kredytowej. Wgraj zdjęcie, wybierz styl i zobacz efekt w 30 sekund.",
    },
    {
      q: "Jakie style wnętrz są dostępne?",
      a: "Oferujemy 15+ stylów: nowoczesny, skandynawski, klasyczny, industrialny, minimalistyczny, boho, glamour, japoński i wiele innych. Lista stale się powiększa.",
    },
    {
      q: "Czy AI zmieni układ mojego mieszkania?",
      a: "Nie. Nasza technologia zachowuje dokładny układ pomieszczenia — ściany, okna, drzwi i kolumny pozostają nietknięte. AI dodaje jedynie meble i dekoracje.",
    },
  ];

  return (
    <div className={`bg-bg-primary ${isLight ? "light-theme" : ""}`}>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">Wnętrze<span className="gradient-ai">AI</span></span>
          </a>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-hover transition-all"
              aria-label="Przełącz motyw"
            >
              {isLight ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
            <Link href="/portfolio" className="text-sm text-text-secondary hover:text-text-primary transition-colors hidden sm:block">
              Portfolio
            </Link>
            <Link href="/staging" className="btn-primary text-sm">
              Wypróbuj staging
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 px-6 overflow-hidden">
        <div className="hero-glow" />
        {/* Blueprint staging animation */}
        <div className="hero-blueprint" aria-hidden="true">
          <svg viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bpScanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="20%" stopColor="rgba(139,92,246,0.6)" />
                <stop offset="50%" stopColor="rgba(56,189,248,0.8)" />
                <stop offset="80%" stopColor="rgba(139,92,246,0.6)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            {/* Room outline */}
            <g className="bp-room" stroke="currentColor" strokeWidth="1.5">
              <rect x="100" y="60" width="600" height="380" rx="2" />
              {/* Window */}
              <line x1="100" y1="160" x2="100" y2="280" strokeWidth="3" />
              <line x1="96" y1="180" x2="96" y2="260" strokeWidth="1" />
              {/* Door */}
              <line x1="520" y1="440" x2="600" y2="440" strokeWidth="3" />
              <path d="M520 440 Q520 380 580 380" strokeWidth="1" strokeDasharray="4 3" />
            </g>
            {/* Scan line */}
            <rect className="bp-scan" x="100" y="60" width="600" height="2" rx="1" fill="url(#bpScanGrad)" />
            {/* Sofa */}
            <g className="bp-furniture bp-f1" stroke="currentColor" strokeWidth="1.2">
              <rect x="200" y="300" width="200" height="70" rx="8" />
              <rect x="195" y="295" width="10" height="80" rx="4" />
              <rect x="395" y="295" width="10" height="80" rx="4" />
              <rect x="210" y="305" width="85" height="12" rx="3" />
              <rect x="305" y="305" width="85" height="12" rx="3" />
            </g>
            {/* Coffee table */}
            <g className="bp-furniture bp-f2" stroke="currentColor" strokeWidth="1.2">
              <rect x="250" y="240" width="100" height="45" rx="4" />
              <circle cx="265" cy="255" r="8" />
            </g>
            {/* Floor lamp */}
            <g className="bp-furniture bp-f3" stroke="currentColor" strokeWidth="1.2">
              <line x1="160" y1="120" x2="160" y2="260" />
              <ellipse cx="160" cy="115" rx="25" ry="12" />
              <line x1="150" y1="260" x2="170" y2="260" />
            </g>
            {/* TV / Wall art */}
            <g className="bp-furniture bp-f4" stroke="currentColor" strokeWidth="1.2">
              <rect x="440" y="100" width="180" height="100" rx="4" />
              <rect x="450" y="110" width="160" height="75" rx="2" />
              <rect x="510" y="200" width="40" height="50" rx="2" />
            </g>
            {/* Plant */}
            <g className="bp-furniture bp-f5" stroke="currentColor" strokeWidth="1.2">
              <rect x="640" y="330" width="35" height="40" rx="4" />
              <ellipse cx="658" cy="315" rx="25" ry="20" />
              <line x1="658" y1="330" x2="658" y2="300" />
              <line x1="648" y1="320" x2="640" y2="305" />
              <line x1="668" y1="318" x2="676" y2="303" />
            </g>
            {/* Rug */}
            <g className="bp-furniture bp-f6" stroke="currentColor" strokeWidth="1.2">
              <rect x="190" y="220" width="230" height="170" rx="6" strokeDasharray="6 4" />
            </g>
          </svg>
        </div>
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center gap-2 badge badge-accent mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                Oszczędź 99% kosztów stagingu
              </div>
              <h1 className="heading-hero mb-6">
                Puste mieszkanie<br />
                <span className="gradient-text">urządzone w 30s</span>
              </h1>
              <p className="body-large mb-8 max-w-lg mx-auto lg:mx-0">
                AI Virtual Staging dla agentów nieruchomości. Dodaj meble i dekoracje do zdjęć pustych wnętrz.{" "}
                <span className="text-text-primary font-medium">40% więcej zapytań</span>, szybsza sprzedaż.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/staging" className="btn-primary">
                  Wypróbuj za darmo
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mt-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  1 darmowy render
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Bez karty kredytowej
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Gotowe w 30 sekund
                </span>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs text-amber-300">Model AI w trakcie treningu — jakość stale rośnie</span>
              </div>
            </div>
            <div className="relative animate-fade-in stagger-2">
              <div className="card-gradient p-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80" alt="Pusty salon" className="w-full h-full object-cover" />
                    <span className="label-before">Przed</span>
                  </div>
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80" alt="Salon po stagingu" className="w-full h-full object-cover" />
                    <span className="label-after">Po</span>
                  </div>
                </div>
                <div className="flex items-center justify-between px-2 py-3">
                  <span className="text-xs text-text-tertiary">Transformacja w 30 sekund</span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1">
                      <div className="w-5 h-5 rounded-full bg-violet-500/30 border border-bg-primary" />
                      <div className="w-5 h-5 rounded-full bg-fuchsia-500/30 border border-bg-primary" />
                      <div className="w-5 h-5 rounded-full bg-amber-500/30 border border-bg-primary" />
                    </div>
                    <span className="text-xs text-text-tertiary">2,100+ agentów</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-bg-tertiary border border-border rounded-xl p-4 shadow-2xl animate-float hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-bold">+40%</div>
                    <div className="text-xs text-text-tertiary">więcej zapytań</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="heading-section mb-4">
              Puste mieszkania sprzedają się<br />
              <span className="text-text-tertiary">wolniej i taniej</span>
            </h2>
            <p className="body-large max-w-2xl mx-auto">
              Kupujący nie potrafią wyobrazić sobie potencjału pustej przestrzeni. Scrollują dalej, zanim zdążysz powiedzieć &quot;świetna lokalizacja&quot;.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "eye", color: "red", title: "Mniej zapytań", desc: "Puste zdjęcia nie przyciągają uwagi w ogłoszeniach. Kupujący scrollują dalej." },
              { icon: "clock", color: "orange", title: "Dłuższy czas sprzedaży", desc: "Oferty z pustymi zdjęciami wiszą średnio 3x dłużej na rynku." },
              { icon: "money", color: "amber", title: "Niższa cena końcowa", desc: "Kupujący negocjują ostrzej przy pustych nieruchomościach. Tracisz prowizję." },
            ].map((card) => (
              <div key={card.title} className="card-gradient text-center">
                <div className={`w-12 h-12 rounded-xl bg-${card.color}-500/10 flex items-center justify-center mx-auto mb-4`}>
                  <svg className={`w-6 h-6 text-${card.color}-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {card.icon === "eye" && <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>}
                    {card.icon === "clock" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                    {card.icon === "money" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                  </svg>
                </div>
                <h3 className="heading-card mb-2">{card.title}</h3>
                <p className="body-small">{card.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="card border-red-500/20 bg-red-500/5 text-center">
              <p className="text-text-tertiary text-sm mb-1">Tradycyjny staging</p>
              <div className="text-4xl font-bold text-red-400">3 000 - 8 000 PLN</div>
              <p className="text-sm text-text-muted mt-1">+ 3-7 dni oczekiwania</p>
            </div>
            <div className="card-featured text-center">
              <p className="text-text-tertiary text-sm mb-1">Wnętrze<span className="gradient-ai">AI</span></p>
              <div className="text-4xl font-bold gradient-text">{prices.starter} PLN</div>
              <p className="text-sm text-violet-300 mt-1">Gotowe w 30 sekund</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 bg-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="heading-section mb-4">Jak to <span className="gradient-text">działa</span>?</h2>
            <p className="body-large max-w-xl mx-auto">Trzy proste kroki. Bez instalacji, bez nauki, bez czekania.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: 1, icon: "photo", color: "violet", title: "Wgraj zdjęcie", desc: "Zrób zdjęcie pustego pokoju telefonem lub aparatem. Wgraj do aplikacji w 5 sekund." },
              { step: 2, icon: "palette", color: "fuchsia", title: "Wybierz styl", desc: "Nowoczesny, klasyczny, skandynawski? Wybierz styl mebli i dekoracji z 15+ dostępnych." },
              { step: 3, icon: "download", color: "amber", title: "Pobierz wynik", desc: "W 30 sekund otrzymujesz profesjonalne zdjęcie gotowe do publikacji w jakości HD." },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                <div className="card text-center h-full">
                  <div className={`w-12 h-12 rounded-xl bg-${s.color}-500/10 flex items-center justify-center mx-auto mb-4`}>
                    <svg className={`w-6 h-6 text-${s.color}-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {s.icon === "photo" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                      {s.icon === "palette" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />}
                      {s.icon === "download" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />}
                    </svg>
                  </div>
                  <div className="badge mb-3">Krok {s.step}</div>
                  <h3 className="heading-card mb-2">{s.title}</h3>
                  <p className="body-small">{s.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <svg className="w-8 h-8 text-[#27273a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY WNETRZEAI */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="heading-section mb-4">Dlaczego <span className="gradient-text">WnetrzeAI</span>?</h2>
            <p className="body-large max-w-xl mx-auto">Jedyne narzędzie do virtual stagingu stworzone dla polskiego rynku nieruchomości.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "flag", color: "violet", title: "Polski produkt", desc: "Interfejs, wsparcie i dokumentacja w 100% po polsku. Faktura VAT." },
              { icon: "shield", color: "green", title: "Zachowuje układ", desc: "AI nie zmienia ścian, okien ani drzwi. Meble pasują do realnego pokoju." },
              { icon: "hd", color: "fuchsia", title: "Jakość HD", desc: "Zdjęcia w pełnej rozdzielczości, bez watermarku, gotowe na OLX i Otodom." },
              { icon: "zap", color: "amber", title: "30 sekund", desc: "Wynik w pół minuty. Tradycyjny staging to 3-7 dni czekania." },
            ].map((f) => (
              <div key={f.title} className="card text-center">
                <div className={`w-12 h-12 rounded-xl bg-${f.color}-500/10 flex items-center justify-center mx-auto mb-4`}>
                  <svg className={`w-6 h-6 text-${f.color}-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {f.icon === "flag" && <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />}
                    {f.icon === "shield" && <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}
                    {f.icon === "hd" && <><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></>}
                    {f.icon === "zap" && <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />}
                  </svg>
                </div>
                <h3 className="heading-card mb-2">{f.title}</h3>
                <p className="body-small">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER EXAMPLES */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="heading-section mb-4">Zobacz <span className="gradient-text">efekty</span></h2>
            <p className="body-large max-w-xl mx-auto">
              Przesuń suwak aby zobaczyć transformację. Prawdziwe zdjęcia, prawdziwe wyniki.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                before: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
                after: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
                label: "Salon — styl nowoczesny",
              },
              {
                before: "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800&q=80",
                after: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80",
                label: "Sypialnia — styl skandynawski",
              },
              {
                before: "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800&q=80",
                after: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
                label: "Kuchnia — styl klasyczny",
              },
              {
                before: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80",
                after: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
                label: "Biuro — styl minimalistyczny",
              },
            ].map((example) => (
              <div key={example.label}>
                <BeforeAfter beforeUrl={example.before} afterUrl={example.after} />
                <p className="text-sm text-text-tertiary text-center mt-3">{example.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 bg-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="heading-section mb-4">Co mówią <span className="gradient-text">agenci</span></h2>
            <p className="body-large max-w-xl mx-auto">Opinie beta testerów, którzy już korzystają z WnetrzeAI.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Marta K.",
                role: "Agent nieruchomości, Warszawa",
                text: "Moje ogłoszenia z virtual stagingiem dostają 2x więcej zapytań. Klienci od razu widzą potencjał mieszkania.",
                stars: 5,
              },
              {
                name: "Tomasz R.",
                role: "Biuro nieruchomości, Kraków",
                text: "Oszczędzamy tysiące złotych na tradycyjnym stagingu. Efekty są realistyczne i gotowe w kilka minut.",
                stars: 5,
              },
              {
                name: "Anna W.",
                role: "Agent nieruchomości, Wrocław",
                text: "Prostota obsługi mnie zaskoczyła — wgrywam zdjęcie, wybieram styl i mam gotową wizualizację. Polecam!",
                stars: 5,
              },
            ].map((t) => (
              <div key={t.name} className="card-gradient">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-text-secondary mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-sm font-semibold text-violet-300">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-text-tertiary">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EARLY ADOPTERS */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 badge badge-accent mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Szukamy pierwszych użytkowników
            </div>
            <h2 className="heading-section mb-4">Dołącz jako <span className="gradient-text">early adopter</span></h2>
            <p className="body-large max-w-xl mx-auto">
              Szukamy <span className="text-text-primary font-semibold">pierwszych 10 agentów</span> do beta testów. Pomóż kształtować produkt i zyskaj dożywotni dostęp ze zniżką.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: "gift", color: "violet", title: "-50% na zawsze", desc: "Early adopters otrzymują dożywotnią zniżkę 50% na każdy plan." },
              { icon: "people", color: "fuchsia", title: "Bezpośredni kontakt", desc: "Twój feedback bezpośrednio wpływa na rozwój produktu. Masz głos." },
              { icon: "bolt", color: "amber", title: "Priorytetowy dostęp", desc: "Pierwszeństwo w dostępie do nowych funkcji i aktualizacji." },
            ].map((b) => (
              <div key={b.title} className="card-gradient text-center">
                <div className={`w-12 h-12 rounded-xl bg-${b.color}-500/10 flex items-center justify-center mx-auto mb-4`}>
                  <svg className={`w-6 h-6 text-${b.color}-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {b.icon === "gift" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />}
                    {b.icon === "people" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
                    {b.icon === "bolt" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />}
                  </svg>
                </div>
                <h3 className="heading-card mb-2">{b.title}</h3>
                <p className="body-small">{b.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/staging" className="btn-primary inline-flex">
              Wypróbuj virtual staging
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className="text-xs text-text-muted mt-4">Tylko 10 miejsc &bull; Brak zobowiązań</p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6 bg-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="heading-section mb-4">Prosty <span className="gradient-text">cennik</span></h2>
            <p className="body-large max-w-xl mx-auto">Zacznij za darmo, skaluj wraz z rozwojem. Bez ukrytych opłat.</p>
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={`text-sm ${isYearly ? "text-text-secondary" : "text-text-primary font-medium"}`}>Miesięcznie</span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`toggle-track ${isYearly ? "active" : ""}`}
                aria-label="Przełącz rozliczanie"
              >
                <span className="toggle-thumb" />
              </button>
              <span className={`text-sm ${isYearly ? "text-text-primary font-medium" : "text-text-secondary"}`}>
                Rocznie {isYearly && <span className="text-violet-400">-20%</span>}
              </span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="card flex flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">Starter</h3>
                <p className="text-sm text-text-tertiary">Dla pojedynczych agentów</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{getPrice(prices.starter)}</span>
                  <span className="text-text-tertiary">PLN/mies</span>
                </div>
                <p className="text-xs text-text-muted mt-1">{(getPrice(prices.starter) / 10).toFixed(2).replace(".", ",")} PLN za render</p>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                {["10 renderów miesięcznie", "Standardowa kolejka", "Bez watermarku", "8 stylów wnętrz"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm"><CheckIcon /><span>{i === 0 ? <><strong className="text-text-primary">10 renderów</strong> miesięcznie</> : f}</span></li>
                ))}
              </ul>
              <button onClick={() => openCheckout("Starter", prices.starter)} className="btn-secondary w-full">Wybieram Starter</button>
            </div>
            {/* Pro */}
            <div className="card-featured flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-violet-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Najpopularniejszy</span>
              </div>
              <div className="mb-6 mt-2">
                <h3 className="text-lg font-semibold mb-1">Pro</h3>
                <p className="text-sm text-text-tertiary">Dla aktywnych agentów</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold gradient-text">{getPrice(prices.pro)}</span>
                  <span className="text-text-tertiary">PLN/mies</span>
                </div>
                <p className="text-xs text-text-muted mt-1">{(getPrice(prices.pro) / 50).toFixed(2).replace(".", ",")} PLN za render</p>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                {[<><strong className="text-text-primary" key="r">50 renderów</strong> miesięcznie</>, <strong className="text-text-primary" key="p">Priorytetowa kolejka</strong>, "Bez watermarku", "Wszystkie style (15+)", "1 poprawka na render"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm"><CheckIcon /><span>{f}</span></li>
                ))}
              </ul>
              <button onClick={() => openCheckout("Pro", prices.pro)} className="btn-primary w-full">
                Wybieram Pro
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
            {/* Agency */}
            <div className="card flex flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">Agency</h3>
                <p className="text-sm text-text-tertiary">Dla biur nieruchomości</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{getPrice(prices.agency)}</span>
                  <span className="text-text-tertiary">PLN/mies</span>
                </div>
                <p className="text-xs text-text-muted mt-1">{(getPrice(prices.agency) / 100).toFixed(2).replace(".", ",")} PLN za render</p>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                {[<><strong className="text-text-primary" key="r">100 renderów</strong> miesięcznie</>, "Najszybsza kolejka", "Nieograniczone poprawki", "Priorytetowe wsparcie", "Faktura VAT"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm"><CheckIcon /><span>{f}</span></li>
                ))}
              </ul>
              <button onClick={() => openCheckout("Agency", prices.agency)} className="btn-secondary w-full">Wybieram Agency</button>
            </div>
          </div>
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 text-sm text-text-tertiary">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>14-dniowa gwarancja zwrotu 100% bez pytań</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="heading-section mb-4">Często zadawane <span className="gradient-text">pytania</span></h2>
            <p className="body-large">Wszystko co musisz wiedzieć zanim zaczniesz.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? "open" : ""} bg-bg-secondary rounded-xl border border-border`}>
                <button className="faq-question px-6 sm:px-8" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  <span>{faq.q}</span>
                  <svg className="faq-icon text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="faq-answer">
                  <div className="px-6 sm:px-8">
                    <p className="text-text-secondary text-sm pb-5">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="cta" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl" />
        <div className="max-w-xl mx-auto text-center relative z-10">
          <h2 className="heading-section mb-4">Gotowy na <span className="gradient-text">więcej zapytań</span>?</h2>
          <p className="body-large mb-8">
            Dołącz do 2,100+ agentów, którzy już sprzedają szybciej dzięki Wnętrze<span className="gradient-ai">AI</span>.
          </p>
          <form action="https://formspree.io/f/xyzyvvpp" method="POST" className="space-y-4">
            <input type="email" name="email" placeholder="Twój adres email" required className="input" />
            <button type="submit" className="btn-primary w-full">
              Rozpocznij za darmo
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </form>
          <p className="text-xs text-text-muted mt-4">Bez spamu. Odezwiemy się tylko gdy produkt będzie gotowy.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="text-lg font-bold">Wnętrze<span className="gradient-ai">AI</span></span>
            </div>
            <a href="mailto:kontakt@wnetrzeai.pl" className="text-sm text-text-tertiary hover:text-text-primary transition-colors">kontakt@wnetrzeai.pl</a>
            <p className="text-xs text-text-muted">&copy; 2026 Wnętrze<span className="gradient-ai">AI</span>. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>

      {/* CHECKOUT MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-[rgba(10,10,15,0.8)] backdrop-blur-lg z-[100] flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-bg-secondary border border-border rounded-2xl p-6 w-full max-w-[420px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {modalState === "form" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Zamówienie <span className="gradient-text">{modal.plan}</span></h3>
                  <button onClick={() => setModal(null)} className="text-text-tertiary hover:text-text-primary transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div className="bg-bg-secondary rounded-xl p-4 border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-text-secondary">Plan</span>
                      <span className="font-medium">{modal.plan}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Cena</span>
                      <span className="text-xl font-bold gradient-text">{modal.price} PLN/mies</span>
                    </div>
                  </div>
                  <input type="hidden" name="plan" value={modal.plan} />
                  <input type="hidden" name="price" value={modal.price} />
                  <div>
                    <label className="block text-sm text-text-secondary mb-2">Imię i nazwisko</label>
                    <input type="text" name="name" placeholder="Jan Kowalski" required className="input" />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-2">Email</label>
                    <input type="email" name="email" placeholder="jan@example.com" required className="input" />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-2">Numer karty</label>
                    <input type="text" name="card" placeholder="4242 4242 4242 4242" maxLength={19} className="input" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-text-secondary mb-2">Data ważności</label>
                      <input type="text" name="expiry" placeholder="MM/RR" maxLength={5} className="input" />
                    </div>
                    <div>
                      <label className="block text-sm text-text-secondary mb-2">CVC</label>
                      <input type="text" name="cvc" placeholder="123" maxLength={3} className="input" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full">
                    Zapłać {modal.price} PLN
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                  <p className="text-xs text-text-muted text-center">To demo. Karta nie zostanie obciążona.</p>
                </form>
              </>
            )}
            {modalState === "loading" && (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-[3px] border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-text-secondary">Przetwarzanie płatności...</p>
              </div>
            )}
            {modalState === "success" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-2">Produkt w budowie!</h4>
                <p className="text-text-secondary">Zapisaliśmy Cię na listę early access. Powiadomimy gdy będzie gotowy.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
