/** Search field used at the top of the Picker. */
export interface SearchInputProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Render in the focused state (for specimens). */
  forceFocus?: boolean;
  style?: React.CSSProperties;
}
export declare function SearchInput(props: SearchInputProps): JSX.Element;
