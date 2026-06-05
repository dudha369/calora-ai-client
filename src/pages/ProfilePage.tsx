import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { User, Target, Bell, Shield, ChevronRight, LogOut } from "lucide-react";

const MENU_ITEMS = [
  { icon: Target, label: "Цели питания", hint: "2 500 ккал / день" },
  { icon: Bell, label: "Уведомления", hint: "Включены" },
  { icon: Shield, label: "Конфиденциальность", hint: "" },
];

export const ProfilePage = () => {
  const { user_data } = useUser();
  const theme = useTheme();

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold" style={{ color: theme.text_color }}>Профиль</h1>

      {/* Avatar card */}
      <section
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{ backgroundColor: theme.section_bg_color, border: `1px solid ${theme.section_separator_color}` }}
      >
        <div
          className="size-16 rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${theme.button_color}20` }}
        >
          <User size={28} style={{ color: theme.button_color }} />
        </div>
        <div>
          <p className="text-lg font-bold" style={{ color: theme.text_color }}>
            {user_data?.user.full_name ?? "Пользователь"}
          </p>
          <p className="text-sm" style={{ color: theme.hint_color }}>
            ID: {user_data?.user.telegram_id ?? "—"}
          </p>
          <p className="text-xs mt-1" style={{ color: theme.hint_color }}>
            В приложении с{" "}
            {user_data?.user.created_at
              ? new Date(user_data.user.created_at).toLocaleDateString("ru-RU", { month: "long", year: "numeric" })
              : "—"}
          </p>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Дней подряд", value: "12" },
          { label: "Блюд добавлено", value: "84" },
          { label: "Цель выполнена", value: "9 раз" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl p-3 text-center"
            style={{ backgroundColor: theme.section_bg_color, border: `1px solid ${theme.section_separator_color}` }}
          >
            <p className="text-lg font-bold" style={{ color: theme.text_color }}>{value}</p>
            <p className="text-[10px] mt-0.5 leading-tight" style={{ color: theme.hint_color }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <section
        className="rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${theme.section_separator_color}` }}
      >
        {MENU_ITEMS.map(({ icon: Icon, label, hint }, i) => (
          <div key={label}>
            <button
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              style={{ backgroundColor: theme.section_bg_color }}
            >
              <div
                className="size-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${theme.button_color}18` }}
              >
                <Icon size={16} style={{ color: theme.button_color }} />
              </div>
              <span className="flex-1 text-sm" style={{ color: theme.text_color }}>{label}</span>
              {hint && <span className="text-xs" style={{ color: theme.hint_color }}>{hint}</span>}
              <ChevronRight size={16} style={{ color: theme.hint_color }} />
            </button>
            {i < MENU_ITEMS.length - 1 && (
              <div className="ml-16 h-px" style={{ backgroundColor: theme.section_separator_color }} />
            )}
          </div>
        ))}
      </section>

      {/* Logout */}
      <button
        className="w-full rounded-2xl py-3.5 text-sm font-semibold"
        style={{
          backgroundColor: `${theme.destructive_text_color}15`,
          color: theme.destructive_text_color,
          border: `1px solid ${theme.destructive_text_color}30`,
        }}
      >
        <span className="flex items-center justify-center gap-2">
          <LogOut size={16} />
          Выйти
        </span>
      </button>
    </div>
  );
};
