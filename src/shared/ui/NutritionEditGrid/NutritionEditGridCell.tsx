import {
  useState,
  useRef,
  useEffect,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import { useTheme } from '@/shared/context/ThemeContext';

export interface NutritionEditGridCellProps {
  label: string;
  value: number;
  unit: string;
  step?: number;
  onChange: (value: number) => void;
}

const fmt = (n: number, step: number) =>
  step < 1 ? n.toFixed(1).replace(/\.0$/, '') : String(Math.round(n));

export const NutritionEditGridCell = ({
  label,
  value,
  unit,
  step = 1,
  onChange,
}: NutritionEditGridCellProps) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      setTimeout(() => {
        inputRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 250);
    }
  }, [isEditing]);

  const handleTap = () => {
    setInputValue(fmt(value, step));
    setIsEditing(true);
  };

  const commit = () => {
    const parsed = Number(inputValue.replace(',', '.'));
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(step < 1 ? Math.round(parsed * 10) / 10 : Math.round(parsed));
    }
    setIsEditing(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const normalized = e.target.value.trim().replace(',', '.');
    if (/^\d*\.?\d*$/.test(normalized)) setInputValue(normalized);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') inputRef.current?.blur();
  };

  const displayValue = fmt(value, step);

  return (
    <div
      className="group relative flex h-13 flex-1 transform-gpu cursor-pointer flex-col items-center justify-center gap-1 py-2 transition-opacity hover:opacity-80 active:opacity-60"
      onClick={!isEditing ? handleTap : undefined}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className="w-16 rounded-lg bg-transparent text-center text-lg font-medium tabular-nums focus:ring-0"
          style={{
            color: theme.text_color,
            height: '1.125rem',
            lineHeight: 1,
            padding: 0,
          }}
        />
      ) : (
        <span className="text-lg leading-none font-medium">{displayValue}</span>
      )}

      <span
        className="text-xs leading-none"
        style={{ color: theme.hint_color }}
      >
        {label || unit}
      </span>

      <div
        className="absolute top-1/2 -right-px h-3/5 w-0.5 -translate-y-1/2 rounded-full group-last:hidden"
        style={{ backgroundColor: theme.section_separator_color }}
      />
    </div>
  );
};
