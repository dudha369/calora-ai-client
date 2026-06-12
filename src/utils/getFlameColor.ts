export function getFlameColor(currentStreak: number) {
  if (currentStreak === 0) return { stroke: 'gray', fill: 'lightgray' };
  else if (currentStreak <= 10) return { stroke: 'orange', fill: 'yellow' };
  else if (currentStreak <= 30) return { stroke: 'red', fill: 'orange' };
  else {
    return { stroke: 'blue', fill: 'purple' };
  }
}
