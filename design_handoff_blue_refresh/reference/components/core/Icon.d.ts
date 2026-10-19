export interface IconProps {
  /** Glyph from the app source. */
  name: 'plus' | 'remove' | 'close' | 'grip';
  /** Rendered size in px. Default 20. */
  size?: number;
  style?: React.CSSProperties;
}
export declare function Icon(props: IconProps): JSX.Element;
