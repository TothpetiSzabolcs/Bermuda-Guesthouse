import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function HashScroller() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    // Only handle hash scrolling on the home page
    if (pathname === "/" && hash) {
      const elementId = hash.replace("#", "");
      const element = document.getElementById(elementId);
      
      if (element) {
        // Small delay to ensure the page is fully rendered
        setTimeout(() => {
          const offset = 64; // Header height offset
          const y = element.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }, 100);
      }
    }
  }, [hash, pathname]);

  return null;
}