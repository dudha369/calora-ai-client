import { createContext } from 'react';
import type { ScannerContextValue } from '../interfaces/ScannerContextValue';

const ScannerContext = createContext<ScannerContextValue | null>(null);

export default ScannerContext;
