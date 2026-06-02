import { useTelegram } from '../../hooks/useTelegram';

interface Props {
  label: string;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
}

export const OptionCard = ({ label, description, isSelected, onClick }: Props) => {
  const { theme } = useTelegram();
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-2xl border transition-all duration-150 active:scale-[0.98]"
      style={{
        backgroundColor: isSelected ? theme.button_color : theme.section_bg_color,
        borderColor: isSelected ? theme.button_color : theme.section_separator_color,
        color: isSelected ? theme.button_text_color : theme.text_color,
      }}
    >
      <span className="font-semibold">{label}</span>
      {description && (
        <p
          className="text-xs mt-0.5 leading-relaxed"
          style={{ color: isSelected ? `${theme.button_text_color}B3` : theme.hint_color }}
        >
          {description}
        </p>
      )}
    </button>
  );
};
