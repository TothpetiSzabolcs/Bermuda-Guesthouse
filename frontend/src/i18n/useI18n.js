import { useContext } from "react";
import { LangContext } from "./LangContext";

export const useI18n = () => {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error("useI18n must be used within a LanguageProvider");
  }
  return context;
};
