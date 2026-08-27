import type { BudgetCode, CapitalPlanIdString } from '../../src/types/budget-types';

export type RowItem = {
  acep: string;
  agency: string;
  agency_description: string;
  plan_id: CapitalPlanIdString;
  category: string;
  category_description: string;
  element: string;
  element_description: string;
  needs_code: string;
  project: string;
  title: string;
  description: string;
  plan_revision: string;
  date: Date | string;
  change_nar: string;
  year_1_allocation: string;
  year_2_allocation: string;
  year_3_allocation: string;
  year_4_allocation: string;
  year_5_allocation: string;
  out_years_allocation: string;
  total_allocation: number;
};

export type NestedJSONItem = {
  [key: string]: {
    code: BudgetCode;
    description: string;
    needs_code: string;
    total_allocation: number;
    children: {
      [key: string]: {
        code: BudgetCode;
        description: string;
        needs_code: string;
        total_allocation: number;
        children: {
          [key: string]: {
            code: BudgetCode;
            description: string;
            needs_code: string;
            total_allocation: number;
            children: {
              [key: string]: {
                code: BudgetCode;
                description: string;
                needs_code: string;
                total_allocation: number;
                children: {
                  [key: string]: {
                    code: BudgetCode;
                    description: string;
                    needs_code: string;
                    total_allocation: number;
                  };
                };
                harmonized_category: string;
              };
            };
          };
        };
      };
    };
  };
};

export type StaticFileNames = 'budget-overview';
