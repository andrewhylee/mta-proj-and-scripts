import axios from 'axios';

export interface AcepDataItem {
  acep: string;
  agency: string;
  agency_description: string;
  plan_id: string;
  category: string;
  category_description: string;
  element: string;
  element_description: string;
  project: string;
  title: string;
  description: string;
  needs_code: string;
  plan_revision: string;
  date: string;
  change_nar: string;
  year_1_allocation: string;
  year_2_allocation: string;
  year_3_allocation: string;
  year_4_allocation: string;
  year_5_allocation: string;
  out_years_allocation: string;
  total_allocation: string;
}

interface AcepSearchResult {
  acep: string;
  title: string;
}

export const getAcepData = async (acep: string): Promise<AcepDataItem[]> => {
  const baseUrl = process.env.BASE_URL ? process.env.BASE_URL : '';
  const response = await axios.get(`${baseUrl}/api/acep/${acep}`);

  const items = response.data as AcepDataItem[];

  return items.map((item) => ({
    ...item,
    date: item.date?.substring(0, 7), // Format date to YYYY-MM
  }));
};

export const getProjectsForAcep = async (acep: string): Promise<number[]> => {
  const response = await axios.get(`/api/acep/projects/${acep}`);

  const projects = response.data as number[];

  const uniqueProjects = Array.from(new Set(projects.map((project: any) => project.project_id)));

  return uniqueProjects;
};

export const searchAcep = async (
  query: string,
  signal: AbortSignal
): Promise<AcepSearchResult[]> => {
  const response = await axios.get(`/api/acep/search/${query}`, { signal }).catch((error) => {
    if (axios.isCancel(error)) {
      // Request was cancelled
    } else {
      // Handle other errors
    }
  });

  if (!response) {
    return [];
  }

  const items = response.data as AcepSearchResult[];

  return items;
};
