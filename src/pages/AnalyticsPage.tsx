import { useTheme } from "../context/ThemeContext";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const DATA = [1920, 2100, 1750, 2300, 1840, 2450, 1600];
const MAX = Math.max(...DATA);

const MEALS = [
  { name: "Завтрак", time: "08:30", kcal: 420, color: "#ff9f0a" },
  { name: "Обед", time: "13:15", kcal: 680, color: "#34c759" },
  { name: "Перекус", time: "16:00", kcal: 180, color: "#af52de" },
  { name: "Ужин", time: "19:45", kcal: 560, color: "#3390ec" },
];

export const AnalyticsPage = () => {
  const theme = useTheme();

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold" style={{ color: theme.text_color }}>Аналитика</h1>

      {/* Weekly bar chart */}
      <section
        className="rounded-2xl p-4"
        style={{ backgroundColor: theme.section_bg_color, border: `1px solid ${theme.section_separator_color}` }}
      >
        <p className="text-sm font-semibold mb-4" style={{ color: theme.text_color }}>Эта неделя</p>
        <div className="flex items-end gap-2 h-24">
          {DATA.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-lg"
                style={{
                  height: `${(val / MAX) * 88}px`,
                  backgroundColor: i === 4 ? theme.button_color : `${theme.button_color}50`,
                  transition: "height 0.6s ease",
                }}
              />
              <span className="text-[10px]" style={{ color: theme.hint_color }}>{DAYS[i]}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 pt-3" style={{ borderTop: `1px solid ${theme.section_separator_color}` }}>
          <div>
            <p className="text-xs" style={{ color: theme.hint_color }}>Среднее/день</p>
            <p className="text-base font-bold" style={{ color: theme.text_color }}>1 994 ккал</p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: theme.hint_color }}>Лучший день</p>
            <p className="text-base font-bold" style={{ color: theme.accent_text_color }}>Сб · 2 450</p>
          </div>
        </div>
      </section>

      {/* Today's meals */}
      <section>
        <p className="text-sm font-semibold mb-3" style={{ color: theme.text_color }}>Приёмы пищи сегодня</p>
        <div className="flex flex-col gap-2">
          {MEALS.map((meal) => (
            <div
              key={meal.name}
              className="rounded-2xl px-4 py-3 flex items-center justify-between"
              style={{ backgroundColor: theme.section_bg_color, border: `1px solid ${theme.section_separator_color}` }}
            >
              <div className="flex items-center gap-3">
                <div className="size-2.5 rounded-full" style={{ backgroundColor: meal.color }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: theme.text_color }}>{meal.name}</p>
                  <p className="text-xs" style={{ color: theme.hint_color }}>{meal.time}</p>
                </div>
              </div>
              <p className="text-sm font-semibold" style={{ color: theme.text_color }}>{meal.kcal} ккал</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
