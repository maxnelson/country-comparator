/**
 * Icon-only controls: add country, remove, drag handle, close.
 * @startingPoint section="Controls" subtitle="Add, remove, grip and close icon buttons" viewport="700x260"
 */
export interface IconButtonProps {
  /** add = solid blue circle; remove = red ×; handle = grip; close = ghost ×. */
  variant?: 'add' | 'remove' | 'handle' | 'close';
  /** Only for `add`: sm = 36px (phones), md = 44px (768px+). */
  size?: 'sm' | 'md';
  /** Accessible name, e.g. "Add country", "Remove Japan". Required. */
  label: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
