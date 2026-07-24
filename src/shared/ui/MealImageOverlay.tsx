import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/context/ThemeContext';
import { type LucideIcon, UtensilsCrossed } from 'lucide-react';

interface MealImageOverlayProps {
  photo_url: string | null;
  displayName: string;
  button?: {
    onClick: () => void;
    icon: LucideIcon;
    iconColor?: string;
  };
}

export const MealImageOverlay = ({
  photo_url,
  displayName,
  button,
}: MealImageOverlayProps) => {
  const theme = useTheme();
  const { t } = useTranslation('home_page');
  const { onClick, icon: Icon, iconColor } = button || {};

  return (
    <div className="relative">
      {photo_url ? (
        <div className="@container w-full">
          <img
            src={photo_url}
            alt={displayName}
            className="h-auto max-h-[100cqw] w-full rounded-2xl object-cover"
          />
        </div>
      ) : (
        <div
          className="flex aspect-2/1 w-full items-center justify-center rounded-2xl"
          style={{ backgroundColor: theme.section_bg_color }}
        >
          <UtensilsCrossed size={36} style={{ color: theme.hint_color }} />
        </div>
      )}

      {Icon && (
        <button
          onClick={onClick}
          aria-label={t('edit_meal')}
          className="absolute right-2 bottom-2 rounded-xl p-2 backdrop-blur-md transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-70"
          style={{
            color: iconColor || theme.text_color,
            backgroundColor: `${theme.bg_color}99`,
          }}
        >
          <Icon size={18} />
        </button>
      )}
    </div>
  );
};
