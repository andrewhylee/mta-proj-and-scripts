import { atom } from 'jotai';
import { ProjectDetail } from '@/data/Helpers/ProjectData';

export interface TransitServiceType {
  agency: string;
  designation: string;
  id: string;
  name: string;
  color: string;
  textColor: string;
  description: string;
  order?: number;
}

export const transitServicesAtom = atom<TransitServiceType[]>([]);

const getProjectsForService = (service: string, projects: ProjectDetail[]) => {
  return projects.filter((project) => project.services.includes(service));
};

const getProjectCountForTransitService = (services: string[], projects: ProjectDetail[]) => {
  if (services.length === 0) {
    return 0;
  }
  if (services.length === 1) {
    return getProjectsForService(services[0], projects).length;
  }
  const projectSet = new Set<number>();
  services.forEach((service) => {
    getProjectsForService(service, projects).forEach((project) => {
      projectSet.add(project.project_id);
    });
  });
  return projectSet.size;
};

const getServiceById = async (id: string): Promise<TransitServiceType | undefined> => {
  const services = await getTransitServices();
  return services.find((service) => service.id === id);
};

const getTransitServices = async (): Promise<TransitServiceType[]> => {
  const response = await import('@/data/services.json');
  const servicesData = response.default as TransitServiceType[];

  return servicesData || [];
};

const subwayServiceOrder: Record<string, number> = {
  'NYCT-1': 1,
  'NYCT-2': 2,
  'NYCT-3': 3,
  'NYCT-4': 4,
  'NYCT-5': 5,
  'NYCT-6': 6,
  'NYCT-7': 7,
  'NYCT-A': 8,
  'NYCT-C': 9,
  'NYCT-E': 10,
  'NYCT-B': 11,
  'NYCT-D': 12,
  'NYCT-F': 13,
  'NYCT-M': 14,
  'NYCT-G': 15,
  'NYCT-L': 16,
  'NYCT-N': 17,
  'NYCT-Q': 18,
  'NYCT-R': 19,
  'NYCT-W': 20,
};

export {
  getProjectsForService,
  getProjectCountForTransitService,
  getServiceById,
  getTransitServices,
  subwayServiceOrder,
};
