import type { ReactNode } from 'react';
import { useTheme } from '@/shared/context/ThemeContext';
import { cn } from '@/shared/lib/cn';

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Общий пилюля-переключатель — раньше дублировался как отдельная разметка
 * в NutritionEditGrid (авто/вручную) и на странице поиска (все/избранное).
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const theme = useTheme();

  return (
    <div
      className={cn('inline-flex gap-px rounded-xl p-1', className)}
      style={{ backgroundColor: theme.secondary_bg_color }}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: isActive
                ? theme.accent_text_color
                : 'transparent',
              color: isActive ? theme.button_text_color : theme.hint_color,
            }}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
