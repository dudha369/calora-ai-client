import { createContext } from 'react';
import type { ScannerContextValue } from '../types/ScannerContextValue';

const ScannerContext = createContext<ScannerContextValue | null>(null);

export default ScannerContext;
