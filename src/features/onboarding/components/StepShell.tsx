import { type ReactNode } from 'react';
import { useTheme } from '@/shared/context/ThemeContext';

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export const StepShell = ({ title, subtitle, children }: Props) => {
  const theme = useTheme();
  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-8">
      <div>
        <h2
          className="text-2xl leading-tight font-bold"
          style={{ color: theme.text_color }}
        >
          {title}
        </h2>
        <p
          className="mt-1.5 text-sm leading-relaxed"
          style={{ color: theme.hint_color }}
        >
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  );
};
