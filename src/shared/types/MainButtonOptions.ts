import type { RGB } from '@tma.js/types';

export interface MainButtonOptions {
  text: string;
  iconCustomEmojiId?: string;
  bgColor?: RGB;
  textColor?: RGB;
  isEnabled: boolean;
  isVisible?: boolean;
  isLoading?: boolean;
  onClick: () => void;
}
