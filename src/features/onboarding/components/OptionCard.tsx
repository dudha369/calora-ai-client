import { useTheme } from '@/shared/context/ThemeContext';

interface Props {
  label: string;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
}

export const OptionCard = ({
  label,
  description,
  isSelected,
  onClick,
}: Props) => {
  const theme = useTheme();
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border p-4 text-left transition-all duration-150 active:scale-[0.98]"
      style={{
        backgroundColor: isSelected
          ? theme.button_color
          : theme.section_bg_color,
        borderColor: isSelected
          ? theme.button_color
          : theme.section_separator_color,
        color: isSelected ? theme.button_text_color : theme.text_color,
      }}
    >
      <span className="font-semibold">{label}</span>
      {description && (
        <p
          className="mt-0.5 text-xs leading-relaxed"
          style={{
            color: isSelected
              ? `${theme.button_text_color}B3`
              : theme.hint_color,
          }}
        >
          {description}
        </p>
      )}
    </button>
  );
};
