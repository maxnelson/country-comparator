/**
 * App header bar.
 * @startingPoint section="Navigation" subtitle="Solid blue app header with mark + wordmark" viewport="700x200"
 */
export interface HeaderProps {
  title?: string;
  href?: string;
  /** Force phone (56px, 16px gutter) or desktop (64px, 24px gutter) metrics; responsive tokens when omitted. */
  layout?: 'phone' | 'desktop';
  showMark?: boolean;
}
export declare function Header(props: HeaderProps): JSX.Element;
