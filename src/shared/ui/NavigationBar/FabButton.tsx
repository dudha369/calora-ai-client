import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  useRef,
  type ReactNode,
  type MouseEvent,
  type ChangeEvent,
} from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useScanner } from '@/features/scanner/hooks/useScanner';
import { isIOSDevice } from '../../lib/isIOSDevice';
import { cn } from '../../lib/cn';

const ICON_ROTATION_SPRING =
  'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';

interface FabButtonProps {
  to: string;
  icon: ReactNode;
  activeIcon?: ReactNode;
  label: string;
  navbarColor: string;
  iconRotation?: number;
}

export const FabButton = ({
  to,
  icon,
  activeIcon,
  label,
  navbarColor,
  iconRotation = 0,
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
        className="relative z-10 flex h-16 w-16 -translate-y-3 items-center justify-center rounded-full"
        style={{
          color: theme.button_text_color,
          backgroundColor: theme.button_color,
          outline: `${navbarColor} solid 5px`,
          boxShadow: `0 6px 16px ${navbarColor}`,
        }}
      >
        {({ isActive }) => (
          <span
            className="relative flex items-center justify-center"
            style={{
              transform: iconRotation
                ? `rotate(${iconRotation}deg)`
                : undefined,
              transition: iconRotation ? ICON_ROTATION_SPRING : undefined,
            }}
          >
            <span
              className={cn(
                'transition-all duration-300',
                isActive
                  ? 'scale-50 rotate-90 opacity-0'
                  : 'scale-100 rotate-0 opacity-100',
              )}
            >
              {icon}
            </span>

            {activeIcon && (
              <span
                className={cn(
                  'absolute transition-all duration-300',
                  isActive
                    ? 'scale-100 rotate-0 opacity-100'
                    : 'scale-50 -rotate-90 opacity-0',
                )}
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
