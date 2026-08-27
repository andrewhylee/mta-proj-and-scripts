type FixedLength = 1 | 2 | 4 | 6 | 8;
export type BudgetCode = string & { length: FixedLength };

export interface BudgetOverviewItem {
  id?: string;
  code: BudgetCode;
  description: string;
  harmonized_category?: string;
  needs_code: string;
  total_allocation: number;
  children?: BudgetOverviewItem[];
}

export interface BudgetFilters {
  plan: Set<string>;
  agency: Set<string>;
  type: Set<string>; // filters on harmonized_category
  needsCode: Set<string>;
}

export type anyAgency =
  | 'Bridges And Tunnels'
  | 'Central Business District Tolling'
  | 'Long Island Rail Road'
  | 'Metro-North Railroad'
  | 'MTA Bus Company'
  | 'MTA Capital Construction Company'
  | 'MTA Interagency'
  | 'New York City Transit'
  | 'Security / Disaster Recovery'
  | 'Staten Island Railway';

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
export type CapitalPlanIdString = '5' | '6' | '7' | '8' | '9' | `${Digit}${Digit}`;
export type CapitalPlansById = { [K in CapitalPlanIdString]: string };
