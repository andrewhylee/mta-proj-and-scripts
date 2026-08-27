import * as aq from 'arquero';
import { elementCodeToHarmonizedCategory } from '../../src/constants/budget-constants';
import type { BudgetCode, CapitalPlansById } from '../../src/types/budget-types';
import type { NestedJSONItem, RowItem } from './updateStaticFile-types';

export function transformBudgetOverviewData(csvString: string) {
  let dt = aq
    .fromCSV(csvString, {
      parse: {
        element: (d) => (d === null ? '' : d), // arquero mistakenly infers missing element values as boolean - this allows it to infer it as string
      },
    })
    .groupby('acep')
    .slice(-1) // last row in group == highest revision number
    .ungroup();

  const planNames: Partial<CapitalPlansById> = {
    '9': '2025-2029 Capital Plan',
    '8': '2020-2024 Capital Plan',
    '7': '2015-2019 Capital Plan',
    '6': '2010-2014 Capital Plan',
    '5': '2005-2009 Capital Plan',
  };
  let nested_json: NestedJSONItem = {};
  let row: RowItem;
  // @ts-ignore
  for (row of dt) {
    /* * Create correct codes / clean data types */
    const code_plan = String(row.plan_id);
    const code_agency = row.agency + code_plan;
    const code_category = code_agency + String(row.category).padStart(2, '0');
    if (row.element == null || row.element == '') row.element = row.acep.slice(-4, -2);
    const code_element = (code_category +
      String(row.element).padStart(2, '0')) as keyof typeof elementCodeToHarmonizedCategory;
    if (row.project == null || row.project == '') row.project = row.acep.slice(-2);
    const code_project = code_element + String(row.project).padStart(2, '0');

    /** Build Plan nodes */
    if (nested_json[row.plan_id] === undefined) {
      nested_json[row.plan_id] = {
        code: code_plan as BudgetCode,
        description: planNames[row.plan_id] as string,
        needs_code: '',
        total_allocation: 0,
        children: {},
      };
    }

    const curr_plan_node = nested_json[row.plan_id];

    /** Build Agency nodes */
    if (curr_plan_node.children[row.agency] === undefined) {
      curr_plan_node.children[row.agency] = {
        code: code_agency as BudgetCode,
        description: row.agency_description,
        needs_code: '',
        total_allocation: 0,
        children: {},
      };
    }

    const curr_agency_node = curr_plan_node.children[row.agency];

    /** Build Category nodes */
    if (curr_agency_node.children[row.category] === undefined) {
      curr_agency_node.children[row.category] = {
        code: code_category as BudgetCode,
        description: row.category_description,
        needs_code: '',
        total_allocation: 0,
        children: {},
      };
    }

    const curr_category_node = curr_agency_node.children[row.category];

    /** Build Element nodes */
    if (curr_category_node.children[row.element] === undefined) {
      curr_category_node.children[row.element] = {
        code: code_element as BudgetCode,
        description: row.element_description,
        needs_code: '',
        total_allocation: 0,
        children: {},
        harmonized_category: elementCodeToHarmonizedCategory[code_element],
      };
    }
    const curr_element_node = curr_category_node.children[row.element];
    const allocation = row.total_allocation ?? 0;

    /** Build Project nodes */
    if (curr_element_node.children[row.project] === undefined) {
      curr_element_node.children[row.project] = {
        code: code_project as BudgetCode,
        description: row.title,
        needs_code: row.needs_code === 'No Needs Code' ? 'N/A' : row.needs_code,
        total_allocation: allocation,
      };
    }

    /** Sum up all allocations to respective parent nodes */
    curr_element_node.total_allocation += allocation;
    curr_category_node.total_allocation += allocation;
    curr_agency_node.total_allocation += allocation;
    curr_plan_node.total_allocation += allocation;
  }

  /** Convert JS objects (mappings) to arrays */
  function recur(node: any) {
    for (let key in node) {
      let child = node[key];
      if (child.children) recur(child.children);
      else return;
      child.children = Object.values(child.children);
    }
  }
  recur(nested_json);
  let static_file_nested_json = Object.values(nested_json).reverse();
  return static_file_nested_json;
}
