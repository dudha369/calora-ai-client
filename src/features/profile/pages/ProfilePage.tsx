import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useUser } from '@/shared/context/UserContext';
import { useTheme } from '@/shared/context/ThemeContext';
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
import { Section } from '@/shared/ui/Section/Section';
import { SectionItem } from '@/shared/ui/Section/SectionItem';
import { admin } from '@/shared/api/admin';
import { SectionItemIcon } from '@/shared/ui/Section/SectionItemIcon';

export const ProfilePage = () => {
  const { user_data } = useUser();
  const { t } = useTranslation('profile_page');
  const theme = useTheme();

  const photo_url = initData.user()?.photo_url;

  const { data: adminConfig } = useQuery({
    queryKey: ['admin', 'config'],
    queryFn: async () => (await admin.getConfig()).data,
    staleTime: 5 * 60 * 1000,
  });

  const isAdmin = adminConfig?.is_admin ?? false;

  return (
    <div className="flex flex-col gap-6 px-4">
      <section className="flex flex-col items-center gap-2 pt-1">
        <div
          className="flex size-24 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.secondary_bg_color }}
        >
          {photo_url ? (
            <img
              src={photo_url}
              className="h-full w-full rounded-full object-cover"
              alt="User photo"
            />
          ) : (
            <User size={48} style={{ color: theme.accent_text_color }} />
          )}
        </div>

        <p
          className="text-center text-[28px] leading-none font-medium tracking-tight"
          style={{ color: theme.text_color }}
        >
          {user_data?.user.full_name ?? t('default_full_name')}
        </p>
      </section>

      <div className="flex flex-col gap-4">
        {isAdmin && (
          <Section title="Admin Panel">
            <SectionItem
              icon={<SectionItemIcon icon={Shield} backgroundColor="#5856D6" />}
              label="Admin Panel"
              to="admin"
            />
          </Section>
        )}

        <Section title={t('body_section.title')}>
          <SectionItem
            icon={<SectionItemIcon icon={Target} backgroundColor="#FF2D55" />}
            label={t('body_section.body.title')}
            to="body"
          />
          <SectionItem
            icon={<SectionItemIcon icon={Sprout} backgroundColor="#34C759" />}
            label={t('body_section.nutrition.title')}
            to="nutrition"
          />
        </Section>

        <Section title={t('progress_section.title')}>
          <SectionItem
            icon={
              <SectionItemIcon
                icon={ChartNoAxesCombinedIcon}
                backgroundColor="#007AFF"
              />
            }
            label={t('progress_section.weight.title')}
            to="weight"
          />
          <SectionItem
            icon={<SectionItemIcon icon={Trophy} backgroundColor="#FF9500" />}
            label={t('progress_section.quests.title')}
            to="quests"
          />
        </Section>

        <Section title={t('settings_section.title')}>
          <SectionItem
            icon={<SectionItemIcon icon={Settings} backgroundColor="#8E8E93" />}
            label={t('settings_section.title')}
            to="settings"
          />
        </Section>
      </div>
    </div>
  );
};
