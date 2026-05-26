import { createContext } from "react";
import type { ScannerContextValue } from "../interfaces/ScannerContextValue.ts";

export const ScannerContext = createContext<ScannerContextValue | null>(null)
