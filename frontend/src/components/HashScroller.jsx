import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function HashScroller() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (pathname !== "/" || !hash) return;

    const id = hash.slice(1);
    const offset = 64;

    let tries = 0;
    const maxTries = 20;

    const tryScroll = () => {
      const el = document.getElementById(id);

      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: "smooth" });
        return;
      }

      tries += 1;
      if (tries < maxTries) {
        setTimeout(tryScroll, 50);
      }
    };

    const t = setTimeout(tryScroll, 50);

    return () => clearTimeout(t);
  }, [hash, pathname]);

  return null;
}
