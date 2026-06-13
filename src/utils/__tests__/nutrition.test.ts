import { describe, it, expect } from 'vitest';
import {
  calcNutritionForAmount,
  checkProductAllergens,
  getAllergenName,
} from '../nutrition';
import type { NutritionPer } from '../../types/productData';

const samplePer100g: NutritionPer = {
  calories: 250,
  protein: 20,
  fat: 10,
  saturatedFat: 3,
  carbs: 30,
  sugars: 5,
  fiber: 2,
  salt: 1,
  sodium: 0.4,
};

describe('calcNutritionForAmount', () => {
  it('calculates for 100g (identity)', () => {
    const result = calcNutritionForAmount(samplePer100g, 100);
    expect(result.calories).toBe(250);
    expect(result.protein).toBe(20);
    expect(result.amountG).toBe(100);
  });

  it('calculates for 200g (double)', () => {
    const result = calcNutritionForAmount(samplePer100g, 200);
    expect(result.calories).toBe(500);
    expect(result.protein).toBe(40);
    expect(result.fat).toBe(20);
  });

  it('calculates for 50g (half)', () => {
    const result = calcNutritionForAmount(samplePer100g, 50);
    expect(result.calories).toBe(125);
    expect(result.carbs).toBe(15);
  });

  it('handles null values gracefully', () => {
    const sparse: NutritionPer = {
      calories: 100,
      protein: null,
      fat: null,
      saturatedFat: null,
      carbs: 20,
      sugars: null,
      fiber: null,
      salt: null,
      sodium: null,
    };
    const result = calcNutritionForAmount(sparse, 150);
    expect(result.calories).toBe(150);
    expect(result.protein).toBeNull();
    expect(result.fat).toBeNull();
    expect(result.carbs).toBe(30);
  });

  it('handles 0g amount', () => {
    const result = calcNutritionForAmount(samplePer100g, 0);
    expect(result.calories).toBe(0);
    expect(result.protein).toBe(0);
  });
});

describe('checkProductAllergens', () => {
  it('finds confirmed allergens matching user list', () => {
    const result = checkProductAllergens(
      { confirmed: ['gluten', 'milk', 'eggs'], traces: ['nuts'] },
      ['gluten', 'nuts'],
    );
    expect(result.confirmed).toEqual(['gluten']);
    expect(result.possible).toEqual(['nuts']);
  });

  it('returns empty when no match', () => {
    const result = checkProductAllergens(
      { confirmed: ['gluten'], traces: ['milk'] },
      ['fish', 'eggs'],
    );
    expect(result.confirmed).toEqual([]);
    expect(result.possible).toEqual([]);
  });

  it('handles empty allergen lists', () => {
    const result = checkProductAllergens(
      { confirmed: [], traces: [] },
      ['gluten'],
    );
    expect(result.confirmed).toEqual([]);
    expect(result.possible).toEqual([]);
  });
});

describe('getAllergenName', () => {
  it('returns Russian name by default', () => {
    expect(getAllergenName('gluten')).toBe('Глютен');
    expect(getAllergenName('milk')).toBe('Молоко');
  });

  it('returns English name when locale is en', () => {
    expect(getAllergenName('gluten', 'en')).toBe('Gluten');
  });

  it('falls back to key for unknown allergen', () => {
    expect(getAllergenName('unknown-allergen')).toBe('unknown-allergen');
  });
});
