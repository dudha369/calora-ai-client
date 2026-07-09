import { useContext } from 'react';
import { ScannerContext } from '../context/ScannerContext';

export const useScanner = () => {
  const ctx = useContext(ScannerContext);
  if (!ctx) throw new Error('useScanner must be used within ScannerProvider');
  return ctx;
};
