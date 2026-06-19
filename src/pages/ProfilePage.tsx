import { useQuery } from '@tanstack/react-query';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import {
  User,
  Shield,
  Target,
  Sprout,
  ChartNoAxesCombinedIcon,
  Trophy,
  Settings,
} from 'lucide-react';
import { initData } from '@tma.js/sdk-react';
import { Section } from '../components/Section/Section';
import { SectionItem } from '../components/Section/SectionItem';
import { admin } from '../api/admin';
import { SectionItemIcon } from '../components/Section/SectionItemIcon.tsx';

export const ProfilePage = () => {
  const { user_data } = useUser();
  const theme = useTheme();

  const photo_url = initData.user()?.photo_url;

  const { data: adminConfig } = useQuery({
    queryKey: ['admin', 'config'],
    queryFn: async () => (await admin.getConfig()).data,
    staleTime: 5 * 60 * 1000,
  });

  const isAdmin = adminConfig?.is_admin ?? false;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col items-center gap-2 pt-6">
        <div
          className="flex size-22 items-center justify-center rounded-full"
          style={{ backgroundColor: `${theme.button_color}20` }}
        >
          {photo_url ? (
            <img
              src={photo_url}
              className="h-full w-full rounded-full object-cover"
              alt="User photo"
            />
          ) : (
            <User size={48} style={{ color: theme.button_color }} />
          )}
        </div>
        <p
          className="text-center text-[22px] font-semibold tracking-wider"
          style={{ color: theme.text_color }}
        >
          {user_data?.user.full_name ?? 'Пользователь'}
        </p>
      </section>

      <section className="flex flex-col gap-4">
        {isAdmin && (
          <Section title="Admin Panel">
            <SectionItem
              icon={
                <SectionItemIcon color="#5856D6">
                  <Shield />
                </SectionItemIcon>
              }
              label="Admin Panel"
              to="admin"
            />
          </Section>
        )}

        <Section title="Моё тело">
          <SectionItem
            icon={
              <SectionItemIcon color="#FF2D55">
                <Target />
              </SectionItemIcon>
            }
            label="Тело и цели"
            to="body"
          />
          <SectionItem
            icon={
              <SectionItemIcon color="#34C759">
                <Sprout />
              </SectionItemIcon>
            }
            label="Питание и здоровье"
            to="nutrition"
          />
        </Section>

        <Section title="Прогресс">
          <SectionItem
            icon={
              <SectionItemIcon color="#007AFF">
                <ChartNoAxesCombinedIcon />
              </SectionItemIcon>
            }
            label="Динамика веса"
            to="weight"
          />
          <SectionItem
            icon={
              <SectionItemIcon color="#FF9500">
                <Trophy />
              </SectionItemIcon>
            }
            label="Квесты и достижения"
            to="quests"
          />
        </Section>

        <Section title="Настройки">
          <SectionItem
            icon={
              <SectionItemIcon color="#8E8E93">
                <Settings />
              </SectionItemIcon>
            }
            label="Настройки"
            to="settings"
          />
        </Section>
      </section>
    </div>
  );
};
