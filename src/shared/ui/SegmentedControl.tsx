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
      className={cn('inline-flex rounded-xl p-1', className)}
      style={{ backgroundColor: theme.secondary_bg_color }}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;

        let backgroundColor, color;
        if (isActive) {
          backgroundColor = theme.accent_text_color;
          color = theme.button_text_color;
        } else {
          backgroundColor = 'transparent';
          color = theme.hint_color;
        }

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex items-center gap-1 rounded-lg px-3 py-1 text-sm font-medium transition-all duration-200 max-sm:px-2"
            style={{
              backgroundColor,
              color,
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
