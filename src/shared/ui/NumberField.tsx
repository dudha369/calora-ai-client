import { useTheme } from '../context/ThemeContext';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  step?: number;
  min?: number;
}

export const NumberField = ({
  label,
  value,
  onChange,
  unit,
  step = 1,
  min = 0,
}: NumberFieldProps) => {
  const theme = useTheme();

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium" style={{ color: theme.hint_color }}>
        {label}
      </span>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          step={step}
          min={min}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          className="w-full rounded-xl py-2 pr-9 pl-3 text-sm font-medium"
          style={{
            backgroundColor: theme.secondary_bg_color,
            color: theme.text_color,
          }}
        />
        {unit && (
          <span
            className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs"
            style={{ color: theme.hint_color }}
          >
            {unit}
          </span>
        )}
      </div>
    </label>
  );
};
