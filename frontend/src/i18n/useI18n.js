import { useContext } from "react";
import { LangContext } from "./LanguageProvider";

export const useI18n = () => useContext(LangContext);