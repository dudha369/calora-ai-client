import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/shared/context/ThemeContext';

export interface NutritionEditGridCellProps {
  label: string;
  value: number;
  unit: string;
  step?: number;
  onChange: (value: number) => void;
  large?: boolean;
}

const fmt = (n: number, step: number) =>
  step < 1 ? n.toFixed(1).replace(/\.0$/, '') : String(Math.round(n));

export const NutritionEditGridCell = ({
  label,
  value,
  unit,
  step = 1,
  onChange,
  large = false,
}: NutritionEditGridCellProps) => {
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleTap = () => {
    setInputValue(fmt(value, step));
    setEditing(true);
  };

  const commit = () => {
    const parsed = Number(inputValue);
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(step < 1 ? Math.round(parsed * 10) / 10 : Math.round(parsed));
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') inputRef.current?.blur();
  };

  const displayValue = fmt(value, step);

  return (
    <div
      className="group relative flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 py-2.5 transition-opacity active:opacity-60"
      onClick={!editing ? handleTap : undefined}
    >
      {editing ? (
        <input
          ref={inputRef}
          type="number"
          inputMode="decimal"
          step={step}
          min={0}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className={`w-16 rounded-lg bg-transparent text-center leading-none font-medium outline-none ${large ? 'text-2xl' : 'text-lg'}`}
          style={{
            color: theme.button_color,
            caretColor: theme.button_color,
          }}
        />
      ) : (
        <span
          className={`leading-none font-medium ${large ? 'text-2xl' : 'text-lg'}`}
        >
          {displayValue}
        </span>
      )}

      <span
        className={`leading-none ${large ? 'text-sm' : 'text-xs'}`}
        style={{ color: theme.hint_color }}
      >
        {label || unit}
      </span>

      {!large && (
        <div
          className="absolute top-1/2 -right-px h-3/5 w-px -translate-y-1/2 group-last:hidden"
          style={{ backgroundColor: theme.section_separator_color }}
        />
      )}
    </div>
  );
};
