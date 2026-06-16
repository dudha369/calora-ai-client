import type { SecondaryButtonPosition } from '@tma.js/bridge';

export interface SecondaryButtonOptions {
  text: string;
  iconCustomEmojiId?: string;
  isEnabled: boolean;
  isVisible?: boolean;
  onClick: () => void;
  position: SecondaryButtonPosition;
}
