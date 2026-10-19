export interface PickerItem {
  id: string;
  label: string;
  /** Leading glyph — an emoji flag for countries. */
  leading?: string;
  /** Trailing hint, e.g. the ISO code. */
  hint?: string;
  /** Extra search terms (codes, aliases). */
  keywords?: string[];
}

/**
 * Searchable picker for adding countries and metrics.
 * @startingPoint section="Overlays" subtitle="Bottom sheet (phone) or popover (desktop) search list" viewport="700x520"
 */
export interface PickerProps {
  open?: boolean;
  /** sheet = phone bottom sheet; popover = 768px+ anchored panel. */
  mode?: 'sheet' | 'popover';
  title: string;
  placeholder?: string;
  emptyMessage?: string;
  items: PickerItem[];
  onSelect?: (item: PickerItem) => void;
  onClose?: () => void;
  /** Popover placement in px relative to the overlay; centered near the top when omitted. */
  anchor?: { top?: number; left?: number; right?: number; bottom?: number };
  /** Position inside the nearest positioned ancestor instead of the viewport. */
  contained?: boolean;
  initialQuery?: string;
}
export declare function Picker(props: PickerProps): JSX.Element | null;
export declare function filterItems(items: PickerItem[], query: string): PickerItem[];
