export interface MainButtonOptions {
  text: string;
  iconCustomEmojiId?: string;
  isEnabled: boolean;
  isVisible?: boolean;
  isLoading?: boolean;
  onClick: () => void;
}
