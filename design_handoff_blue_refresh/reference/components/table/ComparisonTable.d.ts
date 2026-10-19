export interface TableCountry { code: string; name: string; flag: string }
export interface TableMetric { key: string; label: string }

/**
 * The frozen-panes comparison grid — the whole app.
 * @startingPoint section="Comparison" subtitle="Countries across, metrics down, pinned panes + toolbar" viewport="1000x560"
 */
export interface ComparisonTableProps {
  countries: TableCountry[];
  metrics: TableMetric[];
  /** Formatted display string for a cell; "—" for missing data. */
  getValue: (metric: TableMetric, country: TableCountry) => string;
  /** phone: labels span above values, 96px column floor; desktop: 220px pinned label column, 160px floor. */
  layout?: 'phone' | 'desktop';
  /** Edit mode: grips + red remove buttons on rows and columns, toolbar shows Done. */
  editing?: boolean;
  onAddCountry?: (anchor: HTMLElement) => void;
  onAddMetric?: (anchor: HTMLElement) => void;
  onToggleEdit?: () => void;
  onRemoveCountry?: (code: string) => void;
  onRemoveMetric?: (key: string) => void;
  canAddCountry?: boolean;
  canAddMetric?: boolean;
  minCountries?: number;
  minMetrics?: number;
}
export declare function ComparisonTable(props: ComparisonTableProps): JSX.Element;
