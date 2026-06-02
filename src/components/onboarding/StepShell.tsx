import { type ReactNode } from 'react';
import { useTelegram } from '../../hooks/useTelegram';

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export const StepShell = ({ title, subtitle, children }: Props) => {
  const { theme } = useTelegram();
  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-8">
      <div>
        <h2 className="text-2xl font-bold leading-tight" style={{ color: theme.text_color }}>
          {title}
        </h2>
        <p className="text-sm mt-1.5 leading-relaxed" style={{ color: theme.hint_color }}>
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  );
};
