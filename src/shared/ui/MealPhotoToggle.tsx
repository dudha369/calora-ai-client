import { Trash2, ImageOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/context/ThemeContext';
import { MealImageOverlay } from './MealImageOverlay';

interface MealPhotoToggleProps {
  photoUrl: string | null | undefined;
  displayName: string;
  included: boolean;
  onToggle: (included: boolean) => void;
}

/**
 * Фото приёма пищи с возможностью открепить/вернуть его перед сохранением.
 * Единая версия блока, который раньше был продублирован (с расхождениями
 * в деталях) в EditMealSheet, CopyMealSheet, FoodResultModal и
 * BarcodeResultModal. Ничего не рендерит, если фото нет.
 */
export const MealPhotoToggle = ({
  photoUrl,
  displayName,
  included,
  onToggle,
}: MealPhotoToggleProps) => {
  const theme = useTheme();
  const { t } = useTranslation('home_page');

  if (!photoUrl) return null;

  if (included) {
    return (
      <MealImageOverlay
        photo_url={photoUrl}
        displayName={displayName}
        button={{
          onClick: () => onToggle(false),
          icon: Trash2,
          iconColor: theme.destructive_text_color,
        }}
      />
    );
  }

  return (
    <button
      onClick={() => onToggle(true)}
      className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 transition-opacity active:opacity-60"
      style={{ backgroundColor: theme.secondary_bg_color }}
    >
      <ImageOff size={18} style={{ color: theme.hint_color }} />
      <span className="text-sm font-medium" style={{ color: theme.hint_color }}>
        {t('photo_removed')}
      </span>
    </button>
  );
};
