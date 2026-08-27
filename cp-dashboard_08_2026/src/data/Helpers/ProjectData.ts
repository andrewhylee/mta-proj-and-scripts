import axios from 'axios';
import { atom } from 'jotai';

export interface ProjectDetail {
  project_id: number;
  title: string;
  phase: string;
  stage: string;
  agencies: string[];
  asset_categories: string[];
  type: string;
  description: string;
  services: string[];
  capital_plans: string;
  funding_tags?: string;
  districts: string[];
  prime_contractor: string;
  contract_number: string;
  contract_type: string;
  start_date: string;
  initiatives: string[];
  budget_status: string;
  schedule_status: string;
  goal_completion_date: string;
  estimated_actual_completion_date: string;
  goal_project_cost: string;
  estimated_actual_project_cost: string;
  search_tags: string;
  is_active: boolean;
  is_on_schedule?: boolean;
  is_on_budget?: boolean;
  id: string; // Unique key for React rendering
}

export interface ProjectSearchResult {
  project_id: number;
  title: string;
}

export const projectsAtom = atom<ProjectDetail[]>([]);
export const filteredProjectsAtom = atom<ProjectDetail[]>([]);

export const fetchProjects: () => Promise<ProjectDetail[]> = async () => {
  const cachedItems = sessionStorage.getItem('projects');
  let projectData: ProjectDetail[] = [];
  if (!cachedItems) {
    const response = await axios.get(`/api/projects`);
    sessionStorage.setItem('projects', JSON.stringify(response.data));
    projectData = response.data as ProjectDetail[];
  } else {
    projectData = JSON.parse(cachedItems) as ProjectDetail[];
  }

  const projects = projectData.map(mapProjectData) as ProjectDetail[];

  return projects;
};

const mapProjectData = (project: any): ProjectDetail => ({
  ...project,
  project_id: Number(project.project_id),
  is_active: project.phase === 'Construction',
  districts: project.districts ? JSON.parse(project.districts.replace(/'/g, '"')) : [],
  agencies: project.agencies ? JSON.parse(project.agencies.replace(/'/g, '"')) : [],
  services: project.services ? JSON.parse(project.services.replace(/'/g, '"')) : [],
  initiatives: project.initiatives ? JSON.parse(project.initiatives.replace(/'/g, '"')) : [],
  asset_categories: project.asset_categories
    ? JSON.parse(project.asset_categories.replace(/'/g, '"'))
    : [],
  id: project.project_id,
  is_on_budget: project.budget_status ? Number(project.budget_status) <= 1 : undefined,
  is_on_schedule: project.schedule_status ? Number(project.schedule_status) <= 1 : undefined,
});

export const fetchProjectById = async (id: string): Promise<ProjectDetail | null> => {
  const response = await axios.get(`${process.env.BASE_URL}/api/projects/${id}`);

  const data = response.data;
  if (Array.isArray(data) && data.length > 0) {
    return mapProjectData(data[0]);
  }
  return data as ProjectDetail;
};

export const searchProjects = async (
  query: string,
  signal: AbortSignal
): Promise<ProjectSearchResult[]> => {
  const response = await axios.get(`/api/projects/search/${query}`, { signal }).catch((error) => {
    if (axios.isCancel(error)) {
      // Request was cancelled
    } else {
      // Handle other errors
    }
  });

  if (!response) {
    return [];
  }

  const items = response.data as ProjectSearchResult[];

  return items;
};
