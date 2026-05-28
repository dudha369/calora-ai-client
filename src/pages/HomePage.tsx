import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { Flame, Droplets, Dumbbell, TrendingUp } from "lucide-react";

const NAV_HEIGHT = 80; // px — space reserved for the floating nav

export const HomePage = () => {
  const { user } = useUser();
  const theme = useTheme();

  const firstName = user?.name ?? "аноним";

  // Demo stats — replace with real data
  const stats = [
    { label: "Калории", value: "1 840", unit: "ккал", icon: Flame, color: "#ff6b35" },
    { label: "Вода", value: "1.4", unit: "л", icon: Droplets, color: "#3390ec" },
    { label: "Белки", value: "82", unit: "г", icon: Dumbbell, color: "#34c759" },
    { label: "Прогресс", value: "74", unit: "%", icon: TrendingUp, color: theme.accent_text_color },
  ];

  return (
    <div
      className="flex flex-col gap-5 px-4 pt-5"
      style={{ paddingBottom: NAV_HEIGHT }}
    >
      {/* Greeting */}
      <section>
        <p className="text-sm" style={{ color: theme.hint_color }}>
          {new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="text-2xl font-bold mt-0.5" style={{ color: theme.text_color }}>
          Привет, {firstName} 👋
        </h1>
      </section>

      {/* Calorie ring card */}
      <section
        className="rounded-2xl p-5 flex items-center gap-5"
        style={{ backgroundColor: theme.section_bg_color, border: `1px solid ${theme.section_separator_color}` }}
      >
        {/* Simple SVG ring */}
        <div className="relative shrink-0">
          <svg width={88} height={88} viewBox="0 0 88 88">
            <circle cx={44} cy={44} r={36} fill="none" stroke={theme.secondary_bg_color} strokeWidth={10} />
            <circle
              cx={44} cy={44} r={36}
              fill="none"
              stroke={theme.button_color}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - 0.74)}`}
              transform="rotate(-90 44 44)"
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center text-lg font-bold"
            style={{ color: theme.text_color }}
          >
            74%
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <p className="text-xs" style={{ color: theme.hint_color }}>Дневная норма</p>
          <p className="text-3xl font-bold" style={{ color: theme.text_color }}>1 840</p>
          <p className="text-sm" style={{ color: theme.hint_color }}>из 2 500 ккал</p>
          <p className="text-xs mt-1" style={{ color: theme.accent_text_color }}>Осталось 660 ккал</p>
        </div>
      </section>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, unit, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl p-4 flex flex-col gap-2"
            style={{ backgroundColor: theme.section_bg_color, border: `1px solid ${theme.section_separator_color}` }}
          >
            <div
              className="size-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: theme.text_color }}>
                {value} <span className="text-sm font-normal" style={{ color: theme.hint_color }}>{unit}</span>
              </p>
              <p className="text-xs" style={{ color: theme.hint_color }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
