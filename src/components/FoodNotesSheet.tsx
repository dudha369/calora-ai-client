import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useMainButton } from '../hooks/useMainButton';

interface FoodNotesSheetProps {
  /** Вызывается с введённым текстом (пустая строка — пользователь пропустил уточнение) */
  onSubmit: (notes: string) => void;
}

const MAX_NOTES_LENGTH = 300;

/**
 * Шаг между съёмкой фото и запуском ИИ-анализа: позволяет подсказать
 * модели то, что не видно на фото («без сахара», «порция в 2 раза больше»).
 *
 * Не блокирует поток — MainButton всегда активна, текст можно оставить
 * пустым. Отмена/ретейк уже обрабатывается общим useBackButton(clearPhoto)
 * в ScannerPage, поэтому здесь нет отдельной кнопки «отмена».
 */
export const FoodNotesSheet = ({ onSubmit }: FoodNotesSheetProps) => {
  const theme = useTheme();
  const [notes, setNotes] = useState('');

  useMainButton({
    text: notes.trim() ? 'Анализировать с уточнением' : 'Анализировать',
    isEnabled: true,
    onClick: () => onSubmit(notes.trim()),
  });

  return (
    <div
      className="absolute inset-x-4 bottom-6 z-10 flex flex-col gap-2 rounded-2xl p-4 backdrop-blur-sm"
      style={{ backgroundColor: `${theme.bg_color}F2` }}
    >
      <p className="text-sm font-medium" style={{ color: theme.text_color }}>
        Уточнение для ИИ (необязательно)
      </p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value.slice(0, MAX_NOTES_LENGTH))}
        placeholder="Например: без сахара, порция в 2 раза больше обычной…"
        rows={2}
        autoFocus
        className="w-full resize-none rounded-xl p-3 text-sm outline-none"
        style={{
          backgroundColor: theme.section_bg_color,
          color: theme.text_color,
          border: `1px solid ${theme.section_separator_color}`,
        }}
      />
    </div>
  );
};
