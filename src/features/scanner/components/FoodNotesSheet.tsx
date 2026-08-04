import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/context/ThemeContext';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { LabeledTextarea } from '@/shared/ui/LabeledTextarea';

interface FoodNotesSheetProps {
  onSubmit: (notes: string) => void;
  onClose: () => void;
  isProcessing: boolean;
  initialNotes?: string;
}

const MAX_NOTES_LENGTH = 300;

export const FoodNotesSheet = ({
  onSubmit,
  onClose,
  isProcessing,
  initialNotes = '',
}: FoodNotesSheetProps) => {
  const theme = useTheme();
  const { t } = useTranslation('scanner_page');
  const { t: tc } = useTranslation('common');
  const [notes, setNotes] = useState(initialNotes);

  return (
    <BottomSheet
      title={t('dish_rating')}
      onClose={onClose}
      actionLabel={t('analyze')}
      iconCustomEmojiId="5253959125838090076"
      onAction={() => onSubmit(notes.trim())}
      isProcessing={isProcessing}
      secondaryAction={{
        text: t('cancel'),
        iconCustomEmojiId: '5260342697075416641',
        position: 'left',
      }}
      dismissOnBackdrop={false}
      dragToClose={false}
    >
      <div className="flex flex-col gap-2 pb-1">
        <p className="ml-1 text-base" style={{ color: theme.text_color }}>
          {t('clarification')}
        </p>
        <LabeledTextarea
          value={notes}
          onChange={setNotes}
          placeholder={t('clarification_example')}
          optionalLabel={`*${tc('optional')}`}
          maxLength={MAX_NOTES_LENGTH}
          rows={2}
          disabled={isProcessing}
          autoFocus
        />
      </div>
    </BottomSheet>
  );
};
