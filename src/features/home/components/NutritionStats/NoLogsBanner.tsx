import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/context/ThemeContext';
import { NoDataIcon } from '@/shared/ui/NoDataIcon';
import { useNavigate } from 'react-router-dom';

interface AddLogBannerProps {
  isToday: boolean;
}

export const NoLogsBanner = ({ isToday }: AddLogBannerProps) => {
  const navigate = useNavigate();

  const theme = useTheme();
  const { t } = useTranslation('home_page');

  return (
    <div
      className="flex h-36 w-full flex-col items-center justify-center gap-1 rounded-xl py-4"
      style={{
        backgroundColor: theme.section_bg_color,
      }}
      onClick={() => (isToday ? navigate('/scanner') : {})}
    >
      <NoDataIcon
        className="h-22 w-auto"
        accentColor={theme.subtitle_text_color}
        outlineColor={theme.hint_color}
        bgColor={theme.section_separator_color}
        paperColor={theme.section_separator_color}
      />
      <span
        className="text-sm font-medium"
        style={{
          color: theme.subtitle_text_color,
        }}
      >
        {t('no_logs')}
        {isToday && '. ' + t('tap_to_log')}
      </span>
    </div>
  );
};
