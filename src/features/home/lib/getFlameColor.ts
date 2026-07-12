export function getFlameColor(
  currentStreak: number,
  streakActiveToday: boolean,
  inactive_color: string,
) {
  if (currentStreak === 0) return { stroke: 'gray', fill: 'lightgray' };

  if (!streakActiveToday) {
    return { stroke: inactive_color, fill: 'transparent' };
  }

  if (currentStreak <= 10) return { stroke: 'orange', fill: 'yellow' };
  if (currentStreak <= 30) return { stroke: 'red', fill: 'orange' };
  return { stroke: 'blue', fill: 'purple' };
}
