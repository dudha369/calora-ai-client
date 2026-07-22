type FlameColor = {
  color: string;
  fill: string;
};

export function getFlameColor(
  currentStreak: number,
  streakActiveToday: boolean,
  inactive_color: string,
): FlameColor {
  if (currentStreak === 0) {
    return {
      color: '#9CA3AF',
      fill: '#D1D5DB',
    };
  }

  if (!streakActiveToday) {
    return {
      color: inactive_color,
      fill: 'none',
    };
  }

  if (currentStreak <= 3) {
    return { color: '#FF9F00', fill: '#FFD000' };
  }

  if (currentStreak <= 10) {
    return { color: '#E63946', fill: '#FF7F50' };
  }

  if (currentStreak <= 30) {
    return { color: '#B91C1C', fill: '#FF5A5A' };
  }

  if (currentStreak <= 50) {
    return { color: '#7E22CE', fill: '#C084FC' };
  }

  if (currentStreak < 100) {
    return { color: '#2563EB', fill: '#60A5FA' };
  }

  return { color: '#A16207', fill: '#FACC15' };
}
