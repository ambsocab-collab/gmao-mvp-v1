import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatCurrency } from '../../lib/utils';

describe('Utility Functions - lib/utils.ts', () => {
  describe('cn (className utility)', () => {
    test('[P2] should merge class names correctly', () => {
      const result = cn('base-class', 'additional-class');
      expect(result).toBe('base-class additional-class');
    });

    test('[P2] should handle conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'hidden-class');
      expect(result).toBe('base-class conditional-class');
    });

    test('[P2] should handle empty inputs', () => {
      const result = cn();
      expect(result).toBe('');
    });

    test('[P2] should filter undefined values', () => {
      const result = cn('base-class', undefined, 'another-class');
      expect(result).toBe('base-class another-class');
    });
  });

  describe('formatDate', () => {
    test('[P2] should format date string correctly', () => {
      const dateString = '2024-01-15';
      const result = formatDate(dateString);
      expect(result).toMatch(/Jan|January/);
      expect(result).toMatch(/15/);
      expect(result).toMatch(/2024/);
    });

    test('[P2] should handle invalid date gracefully', () => {
      const invalidDate = 'invalid-date';
      const result = formatDate(invalidDate);
      expect(result).toBe('Invalid Date');
    });

    test('[P2] should handle null/undefined inputs', () => {
      expect(formatDate(null as any)).toBe('Invalid Date');
      expect(formatDate(undefined as any)).toBe('Invalid Date');
    });
  });

  describe('formatCurrency', () => {
    test('[P2] should format positive numbers correctly', () => {
      const result = formatCurrency(1234.56);
      expect(result).toBe('$1,234.56');
    });

    test('[P2] should format zero correctly', () => {
      const result = formatCurrency(0);
      expect(result).toBe('$0.00');
    });

    test('[P2] should format negative numbers correctly', () => {
      const result = formatCurrency(-123.45);
      expect(result).toBe('-$123.45');
    });

    test('[P2] should handle decimal places correctly', () => {
      const result = formatCurrency(123.4);
      expect(result).toBe('$123.40');

      const result2 = formatCurrency(123.456);
      expect(result2).toBe('$123.46');
    });
  });
});