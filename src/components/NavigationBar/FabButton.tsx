import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  useRef,
  type ReactNode,
  type MouseEvent,
  type ChangeEvent,
} from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useScanner } from '../../hooks/useScanner';
import { isIOSDevice } from '../../utils/isIOSDevice';

interface FabButtonProps {
  to: string;
  icon: ReactNode;
  activeIcon?: ReactNode;
  label: string;
  navbarColor: string;
}

export const FabButton = ({
  to,
  icon,
  activeIcon,
  label,
  navbarColor,
}: FabButtonProps) => {
  const theme = useTheme();
  const { triggerCapture } = useScanner();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const location = useLocation();
  const isActive = location.pathname === to;
  const isIOS = isIOSDevice();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      navigate(to, { state: { photo: dataUrl }, replace: isActive });
    };
    reader.readAsDataURL(file);

    if (e.target) e.target.value = '';
  };

  const handleClick = (e: MouseEvent) => {
    if (isIOS) {
      e.preventDefault();
      fileInputRef.current?.click();
      return;
    }

    if (isActive) {
      e.preventDefault();
      triggerCapture();
    }
  };

  return (
    <>
      {isIOS && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      )}

      <NavLink
        to={to}
        title={label}
        onClick={handleClick}
        className="flex h-16 w-16 -translate-y-3 items-center justify-center rounded-full"
        style={{
          color: theme.button_text_color,
          backgroundColor: theme.button_color,
          outline: `${navbarColor} solid 5px`,
        }}
      >
        {({ isActive }) => (
          <span className="relative flex items-center justify-center">
            <span
              className={`transition-all duration-300 ${
                isActive
                  ? 'scale-50 rotate-90 opacity-0'
                  : 'scale-100 rotate-0 opacity-100'
              }`}
            >
              {icon}
            </span>

            {activeIcon && (
              <span
                className={`absolute transition-all duration-300 ${
                  isActive
                    ? 'scale-100 rotate-0 opacity-100'
                    : 'scale-50 -rotate-90 opacity-0'
                }`}
              >
                {activeIcon}
              </span>
            )}
          </span>
        )}
      </NavLink>
    </>
  );
};
