import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/context/ThemeContext';
import { BottomSheet } from '@/shared/ui/BottomSheet.tsx';
import type { FocusEvent } from 'react';

interface FoodNotesSheetProps {
  onSubmit: (notes: string) => void;
  onClose: () => void;
  isProcessing: boolean;
}

const MAX_NOTES_LENGTH = 300;

export const FoodNotesSheet = ({
  onSubmit,
  onClose,
  isProcessing,
}: FoodNotesSheetProps) => {
  const theme = useTheme();
  const { t } = useTranslation('scanner_page');
  const [notes, setNotes] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      textAreaRef.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleFocus = (e: FocusEvent<HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);
  };

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
        <div
          className="relative h-16.5 w-full rounded-xl"
          style={{
            backgroundColor: theme.section_bg_color,
            border: `1px solid ${theme.section_separator_color}`,
          }}
          onClick={() => textAreaRef.current?.focus()}
        >
          <textarea
            disabled={isProcessing}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('clarification_example')}
            rows={2}
            maxLength={MAX_NOTES_LENGTH}
            ref={textAreaRef}
            onFocus={handleFocus}
            className="h-12 w-full resize-none rounded-t-2xl p-2 pb-0 text-sm outline-none"
            style={{
              backgroundColor: theme.section_bg_color,
              color: theme.text_color,
            }}
          />
          <div
            className="pointer-events-none absolute bottom-1 flex w-full justify-between px-1.5 text-xs leading-none"
            style={{ color: theme.hint_color }}
          >
            <span>{t('optional')}</span>
            <span>
              {notes.length}/{MAX_NOTES_LENGTH}
            </span>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};
