/**
 * Text button used in the table toolbar.
 * @startingPoint section="Controls" subtitle="Toolbar buttons: Add metric, Edit / Done" viewport="700x260"
 */
export interface ButtonProps {
  /** default = white outlined (hover tints blue); primary = solid blue (Edit mode "Done"). */
  variant?: 'default' | 'primary';
  /** Leading glyph, e.g. "plus" for Add metric. */
  icon?: 'plus' | 'remove' | 'close' | 'grip';
  children?: React.ReactNode;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit';
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
