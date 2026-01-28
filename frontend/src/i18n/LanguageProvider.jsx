import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "./translations.js";

const LangContext = createContext();

const getInitialLang = () => {
  const saved = localStorage.getItem("lang");
  if (saved && translations[saved]) return saved;
  return "hu";
};

const deepGet = (obj, path) => path.split(".").reduce((o, k) => (o && o[k] != null ? o[k] : undefined), obj);
const interpolate = (str, params = {}) =>
  typeof str === "string" ? str.replace(/\{(\w+)\}/g, (_, k) => (params[k] ?? `{${k}}`)) : str;

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(getInitialLang);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useMemo(() => {
    return (key, params) => {
      const val = deepGet(translations[lang], key);
      return interpolate(val ?? key, params);
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
};

export const useI18n = () => useContext(LangContext);
