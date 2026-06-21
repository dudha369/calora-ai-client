/**
 * Возвращает корректную русскую форму слова «блюдо» для числительного.
 * Вынесено в utils, т.к. используется и в компактной карточке
 * (FoodLogCard), и в детальной модалке (FoodLogModal) — без этого
 * пришлось бы дублировать склонение в двух местах.
 */
export function pluralizeDishes(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 14) return 'блюд';
  if (mod10 === 1) return 'блюдо';
  if (mod10 >= 2 && mod10 <= 4) return 'блюда';
  return 'блюд';
}
