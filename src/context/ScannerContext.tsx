import { createContext, useContext } from "react";
import type { ScannerContextValue } from "../interfaces/ScannerContextValue.ts";

export const ScannerContext = createContext<ScannerContextValue | null>(null)

export const useScanner = () => {
  const ctx = useContext(ScannerContext);
  if (!ctx) throw new Error("useScanner must be used within ScannerProvider");
  return ctx;
};
