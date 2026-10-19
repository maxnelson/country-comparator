export interface FooterColumn { heading: string; links: { label: string; href: string }[] }

/** Site footer: three link columns, copyright and the mark. */
export interface FooterProps {
  columns?: FooterColumn[];
  /** phone stacks the columns (source breakpoint: 640px). */
  layout?: 'phone' | 'desktop';
  year?: number;
}
export declare function Footer(props: FooterProps): JSX.Element;
