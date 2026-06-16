import { useTheme } from '../../context/ThemeContext';
import { NoDataIcon } from '../NoDataIcon';
import { useNavigate } from 'react-router-dom';

export const AddLogBanner = () => {
  const navigate = useNavigate();

  const theme = useTheme();

  return (
    <div
      className="flex h-36 w-full flex-col items-center justify-center gap-1 rounded-xl py-4"
      style={{
        backgroundColor: theme.section_bg_color,
      }}
      onClick={() => {
        navigate('/scanner');
      }}
    >
      <NoDataIcon
        className="h-22 w-auto"
        accentColor={theme.subtitle_text_color}
        outlineColor={theme.hint_color}
        bgColor={theme.section_separator_color}
        paperColor={theme.section_separator_color}
      />
      <span
        className="text-sm font-medium"
        style={{
          color: theme.subtitle_text_color,
        }}
      >
        Tap + to log meal
      </span>
    </div>
  );
};
