/** The Country Comparator rounded-bars mark. */
export interface MarkProps {
  /** tile = bars on a rounded blue square; bars = the two bars alone. */
  variant?: 'tile' | 'bars';
  /** Height in px. */
  size?: number;
  /** Tile fill (tile) or bar fill (bars). Defaults to --color-brand-strong. */
  color?: string;
  /** Bar fill on the tile. Default white. */
  barColor?: string;
  /** Accessible name; omit when decorative next to the wordmark. */
  title?: string;
}
export declare function Mark(props: MarkProps): JSX.Element;
