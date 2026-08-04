import { type ChangeEvent, type FocusEvent } from 'react';
import { useTheme } from '@/shared/context/ThemeContext';

interface LabeledTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Подпись над полем, например "Заметка" */
  label?: string;
  /** Текст бейджа снизу-слева, например "*необязательно". Не задан — бейдж не показывается. */
  optionalLabel?: string;
  maxLength: number;
  rows?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * Textarea с ограничением по символам и счётчиком снизу — общий паттерн,
 * который раньше был продублирован в FoodNotesSheet, QuickWeightSheet и
 * FoodTextEntrySheet каждый раз чуть по-своему. Прокручивает поле в
 * видимую область при фокусе — иначе клавиатура на iOS перекрывает инпут
 * внутри BottomSheet/страницы.
 */
export const LabeledTextarea = ({
  value,
  onChange,
  placeholder,
  label,
  optionalLabel,
  maxLength,
  rows = 3,
  disabled = false,
  autoFocus = false,
}: LabeledTextareaProps) => {
  const theme = useTheme();

  const handleFocus = (e: FocusEvent<HTMLTextAreaElement>) => {
    setTimeout(
      () => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      250,
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span
          className="px-1 text-xs font-medium"
          style={{ color: theme.hint_color }}
        >
          {label}
        </span>
      )}
      <div
        className="relative w-full rounded-xl"
        style={{
          backgroundColor: theme.section_bg_color,
          border: `1px solid ${theme.section_separator_color}`,
        }}
      >
        <textarea
          autoFocus={autoFocus}
          value={value}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            onChange(e.target.value)
          }
          onFocus={handleFocus}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          className="w-full rounded-xl bg-transparent p-3 pb-6 text-sm"
          style={{ color: theme.text_color }}
        />
        <div
          className="pointer-events-none absolute right-2 bottom-1.5 left-2 flex items-center justify-between text-[11px] leading-none"
          style={{ color: theme.hint_color }}
        >
          <span>{optionalLabel ?? ''}</span>
          <span>
            {value.length}/{maxLength}
          </span>
        </div>
      </div>
    </div>
  );
};
