import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/context/ThemeContext';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import type { WaterLog } from '@/shared/types/api/water';

interface WaterLogModalProps {
  log: WaterLog;
  isDeleting: boolean;
  onDelete: (logId: number) => void;
  onClose: () => void;
}

export const WaterLogModal = ({
  log,
  isDeleting,
  onDelete,
  onClose,
}: WaterLogModalProps) => {
  const theme = useTheme();
  const {t} = useTranslation('water_page');

  return (
    <BottomSheet
      onClose={onClose}
      title={
        <span className="text-base leading-tight font-semibold">
          {t('add_custom')}
        </span>
      }
      titleClassName="text-sm!"
      dragToClose
      actionLabel={t('add', { mlCount })}
      iconCustomEmojiId={'5258108352008823107'}
      onAction={() => onConfirm(mlCount)}
      actionDisabled={!mlCount}
    ></BottomSheet>
  );
};
