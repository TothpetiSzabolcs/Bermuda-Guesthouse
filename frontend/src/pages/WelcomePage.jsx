import React, { useEffect, useMemo, useState } from "react";
import bg from "../assets/welcome_screen_bg.jpg";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

const TEXT = {
  hu: {
    title: "Kikapcsolódás, élmények, hagyományok – mindez a Bermuda Vendégházban!",
    description:
      "Legyen szó baráti összejövetelről, családi pihenésről vagy különleges programokról, nálunk megtalálja. Fürdőtó, grill, off-road túrák és hagyományos falusi élmények várják vendégeinket Somogy szívében.",
    cta: "Tovább",
  },
  en: {
    title: "Relaxation, experiences, traditions – everything at Bermuda Guesthouse!",
    description:
      "Whether it's a friendly gathering, a family getaway, or special activities, we have it all. Bathing lake, grill, off-road tours, and traditional village experiences await you in the heart of Somogy.",
    cta: "Continue",
  },
  de: {
    title: "Entspannung, Erlebnisse, Traditionen – alles im Bermuda Gästehaus!",
    description:
      "Ob Freundetreffen, Familienurlaub oder besondere Programme – bei uns finden Sie alles. Badeteich, Grill, Offroad-Touren und traditionelle Dorferlebnisse erwarten Sie im Herzen von Somogy.",
    cta: "Weiter",
  },
};

const getInitialLang = () => {
  const saved = localStorage.getItem("lang");
  return saved && TEXT[saved] ? saved : "hu";
};

const WelcomePage = () => {
  const [lang, setLang] = useState(getInitialLang);
  const t = useMemo(() => TEXT[lang], [lang]);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <>
      <SEO
        title="Bermuda Vendégház - Kikapcsolódás Somogy szívében"
        description="Legyen szó baráti összejövetelről, családi pihenésről vagy különleges programokról, nálunk megtalálja. Fürdőtó, grill, off-road túrák és hagyományos falusi élmények."
        canonicalUrl="https://bermuda-vendeghaz.hu/welcome"
      />
      <div className="relative h-screen w-full overflow-hidden">
      <img
        src={bg}
        alt="background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-transparent" />

      <section
        aria-label="Welcome info"
        className="
          absolute z-10
          top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[18rem]
          sm:top-auto sm:left-[5%] sm:bottom-[10%]
          sm:translate-x-0 sm:translate-y-0
          sm:w-[30rem]
          rounded-2xl border border-white/20
          bg-white/5 backdrop-blur-md backdrop-saturate-150
          shadow-xl ring-1 ring-white/5 text-white
        "
      >

        <div
          className="absolute right-1 top-3 flex gap-2 mb-3"
          role="group"
          aria-label="Language switcher"
        >
          {["hu", "en", "de"].map((code) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={
                "px-2 py-1 rounded-md text-xs font-medium transition " +
                (lang === code
                  ? "bg-white/30 ring-1 ring-white/40"
                  : "bg-black/30 hover:bg-black/50")
              }
              aria-pressed={lang === code}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-6 mt-4">
          <h2 className="text-xl sm:text-xl font-semibold my-5">{t.title}</h2>
          <p className="mt-2 text-sm sm:text-base text-white/90">
            {t.description}
          </p>

          <div className="mt-6 flex items-center gap-3 justify-center sm:justify-start">
            <Link to="/home" className="rounded-xl bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30 transition">
              {t.cta}
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-t-2xl" />
      </section>
    </div>
    </>
  );
};

export default WelcomePage;
