import { type ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Minus } from 'lucide-react';
import { useTheme } from '@/shared/context/ThemeContext';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { WaterJug } from '@/features/water/components/WaterJug';
import { InputButton } from '@/features/water/components/CustomAdd/InputButton';
import { QuickAddButton } from '@/features/water/components/CustomAdd/QuickAddButton';

interface CustomAddModalProps {
  onClose: () => void;
  onConfirm: (ml: number) => void;
}

type Sign = 1 | -1;

const CHANGE_STEP_VALUE = 10;
const MAX_VALUE = 3000;

export const CustomAddModal = ({ onClose, onConfirm }: CustomAddModalProps) => {
  const theme = useTheme();
  const { t } = useTranslation('water_page');

  const [mlCount, setMlCount] = useState<number>(100);
  const increaseMlCount = (ml: number) => {
    setMlCount(mlCount + ml);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMlCount(parseInt(e.target.value) || 0);
  };

  const handleClick = (sign: Sign) => {
    increaseMlCount(CHANGE_STEP_VALUE * sign);
  };

  return (
    <BottomSheet
      onClose={onClose}
      title={
        <span className="text-base leading-tight font-semibold">
          {t('add_custom')}
        </span>
      }
      dragToClose
      actionLabel={t('add', { mlCount })}
      iconCustomEmojiId={'5258108352008823107'}
      onAction={() => onConfirm(mlCount)}
      actionDisabled={!mlCount}
    >
      <div className="flex flex-col gap-3">
        <WaterJug valueMl={mlCount} goalMl={MAX_VALUE} showScale />

        <div
          className="relative flex h-10 justify-between rounded-lg"
          style={{ backgroundColor: theme.secondary_bg_color }}
        >
          <InputButton
            icon={Minus}
            side={'left'}
            onClick={() => handleClick(-1)}
          />

          <input
            type="number"
            value={mlCount}
            max={MAX_VALUE}
            onChange={handleChange}
            className="w-full flex-1 p-2 text-center text-lg font-bold"
            style={{
              color: theme.text_color,
            }}
          />

          <InputButton
            icon={Plus}
            side={'right'}
            onClick={() => handleClick(1)}
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          <QuickAddButton value={100} onClick={increaseMlCount} />
          <QuickAddButton value={250} onClick={increaseMlCount} />
          <QuickAddButton value={500} onClick={increaseMlCount} />
          <QuickAddButton value={1000} onClick={increaseMlCount} />
        </div>
      </div>
    </BottomSheet>
  );
};
