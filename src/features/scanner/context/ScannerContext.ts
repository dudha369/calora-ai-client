import { createContext } from 'react';
import type { ScannerContextValue } from '../types/ScannerContextValue';

export const ScannerContext = createContext<ScannerContextValue | null>(null);


