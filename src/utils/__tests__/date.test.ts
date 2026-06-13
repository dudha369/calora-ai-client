import { describe, it, expect } from 'vitest';
import { isSameDay, toApiDate, startOfDay } from '../date';

describe('isSameDay', () => {
  it('returns true for same calendar day', () => {
    const a = new Date(2026, 5, 14, 10, 30);
    const b = new Date(2026, 5, 14, 23, 59);
    expect(isSameDay(a, b)).toBe(true);
  });

  it('returns false for different days', () => {
    const a = new Date(2026, 5, 14);
    const b = new Date(2026, 5, 15);
    expect(isSameDay(a, b)).toBe(false);
  });

  it('returns false for same day different month', () => {
    const a = new Date(2026, 0, 14);
    const b = new Date(2026, 5, 14);
    expect(isSameDay(a, b)).toBe(false);
  });
});

describe('toApiDate', () => {
  it('formats date as YYYY-MM-DD', () => {
    expect(toApiDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('pads single-digit month and day', () => {
    expect(toApiDate(new Date(2026, 2, 3))).toBe('2026-03-03');
  });

  it('handles December correctly', () => {
    expect(toApiDate(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('startOfDay', () => {
  it('resets time to midnight', () => {
    const d = startOfDay(new Date(2026, 5, 14, 15, 30, 45, 123));
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
    expect(d.getMilliseconds()).toBe(0);
  });

  it('does not mutate the original date', () => {
    const original = new Date(2026, 5, 14, 12, 0);
    startOfDay(original);
    expect(original.getHours()).toBe(12);
  });
});
