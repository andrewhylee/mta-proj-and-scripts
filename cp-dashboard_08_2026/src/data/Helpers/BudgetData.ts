import axios from 'axios';

export interface BudgetItem {
  id?: string;
  update_date: Date;
  acep?: string;
  task: string;
  current_budget: string;
  eac: string;
  expenditures: string;
  baseline_budget: string;
  project_id?: number;
}

export const getBudgetDataForProject = async (project_id: number): Promise<BudgetItem[]> => {
  const response = await axios.get(`/api/budget/${project_id}`);

  const items = response.data as BudgetItem[];

  const data = items.map((item) => ({
    ...item,
    update_date: new Date(item.update_date),
  }));

  return data;
};
