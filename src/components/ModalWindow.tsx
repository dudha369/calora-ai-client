import type { ReactNode } from "react";
import { X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface ModalWindowProps {
  onClose: () => void;
  title?: string;
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  isProcessing?: boolean;
}

export const ModalWindow = ({
                              onClose,
                              title,
                              children,
                              actionLabel,
                              onAction,
                              isProcessing = false,
                            }: ModalWindowProps) => {
  const theme = useTheme();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl px-6 pt-3 pb-5 shadow-xl flex flex-col relative"
        style={{
          backgroundColor: theme.bg_color,
          color: theme.text_color,
        }}
      >
        <header className="flex justify-center items-center w-full relative">
          <span className="text-xl font-bold">{title}</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 transition-colors absolute -right-2"
          >
            <X size={24} style={{ color: theme.text_color }} />
          </button>
        </header>

        <main className="w-full">
          {children}
        </main>

        {actionLabel && onAction && (
          <footer className="w-full">
            <button
              onClick={onAction}
              disabled={isProcessing}
              className="w-full py-3.5 mt-3 rounded-2xl font-semibold transition-opacity duration-200 disabled:opacity-50"
              style={{
                backgroundColor: theme.button_color,
                color: theme.button_text_color,
              }}
            >
              {isProcessing ? "Загрузка..." : actionLabel}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};
