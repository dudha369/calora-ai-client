import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import type { ReactNode } from 'react';

interface SectionItemProps {
  icon: ReactNode;
  label: string;
  color?: string;
  to?: string;
  onClick?: () => void;
  right?: ReactNode;
}

export const SectionItem = ({
  icon,
  label,
  color,
  to,
  onClick,
  right,
}: SectionItemProps) => {
  const theme = useTheme();

  const content = (
    <>
      <div
        className="z-10 flex items-center gap-3.5 text-[17px]"
        style={{ color: color ?? theme.text_color }}
      >
        {icon}
        <span className="text-base">{label}</span>
      </div>

      <div className="z-10 flex items-center">
        {right ? (
          right
        ) : to ? (
          <ChevronRight color={theme.hint_color} size={20} strokeWidth={2.5} />
        ) : null}
      </div>

      <div
        className="absolute right-4 bottom-0 left-13.5 h-[0.5px] group-last:hidden"
        style={{
          backgroundColor: theme.section_separator_color,
        }}
      />
    </>
  );

  const baseClassName =
    'group relative flex w-full items-center justify-between px-4 py-3 transition-colors';

  if (to) {
    return (
      <Link to={to} className={baseClassName}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={baseClassName}>
        {content}
      </button>
    );
  }

  return <div className={baseClassName}>{content}</div>;
};
