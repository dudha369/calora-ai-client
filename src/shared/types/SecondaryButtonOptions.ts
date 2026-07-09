import type { SecondaryButtonPosition } from '@tma.js/bridge';
import type { RGB } from '@tma.js/types';

export interface SecondaryButtonOptions {
  text: string;
  iconCustomEmojiId?: string;
  bgColor?: RGB;
  textColor?: RGB;
  isEnabled: boolean;
  isVisible?: boolean;
  onClick: () => void;
  position?: SecondaryButtonPosition;
}
