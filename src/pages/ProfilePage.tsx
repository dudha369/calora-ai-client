import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { User, Trash2 } from "lucide-react";
import {useDebugReset} from "../hooks/useDebugReset";
import { initData } from "@telegram-apps/sdk-react";
import { Section } from "../components/Section";
import { SectionItem } from "../components/SectionItem";

export const ProfilePage = () => {
  const { user_data } = useUser();
  const theme = useTheme();
  const { debugProps } = useDebugReset();

  const photo_url = initData.user()?.photo_url;

  return (
    <div className="flex flex-col gap-6">
      <section className="pt-6 flex flex-col items-center gap-1">
        <button
          {...debugProps}
          className="absolute top-5 right-5 rounded-full p-2"
          style={{
            backgroundColor: `${theme.destructive_text_color}15`,
            border: `1px solid ${theme.destructive_text_color}30`,
            color: theme.destructive_text_color,
          }}
        >
          <Trash2 size={18} />
        </button>

        <div
          className="size-24 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${theme.button_color}20` }}
        >
          {photo_url ? (
            <img src={photo_url} className="w-full h-full rounded-full" alt="User photo" />
          ) : (
            <User size={48} style={{ color: theme.button_color }} />
          )}
        </div>
        <p
          className="text-xl font-semibold text-center"
          style={{ color: theme.text_color }}
        >
          {user_data?.user.full_name ?? "Пользователь"}
        </p>
      </section>

      <Section>
        <SectionItem />
        <SectionItem />
        <SectionItem />
        <SectionItem />
      </Section>

      <Section>
        <SectionItem />
      </Section>
    </div>
  );
};
