import filters from '@/data/filters.json';
import districtLookup from '@/data/geography-lookup.json';
import { ProjectDetail } from '@/data/Helpers/ProjectData';
import { ActiveFilter } from './ActiveFilters';

export const getLabelForFilter = (filterName: string, filterValue: string) => {
  if (filterName.includes('Date')) {
    if (filterName === 'startDate') {
      return `Start Date: ${filterValue}`;
    } else if (filterName === 'endDate') {
      return `End Date: ${filterValue}`;
    }
  }

  if (filterName === 'geography') {
    const district = districtLookup.find((dl) => dl.short_code === filterValue);
    return district ? district.long_name : filterValue;
  }

  const option = filters
    .find((filter) => filter.name === filterName)
    ?.options.find((option) => option.value.toString() === filterValue);

  return option ? option.label : null;
};

const getFilterValues = (filterName: string, projects: ProjectDetail[]) => {
  const uniqueValues = new Set<string | number>();

  projects.forEach((project) => {
    const projectValue = project[filterName as keyof ProjectDetail];
    if (Array.isArray(projectValue)) {
      projectValue.forEach((value) => uniqueValues.add(value));
    } else if (projectValue !== undefined && projectValue !== null) {
      if (typeof projectValue === 'string' || typeof projectValue === 'number') {
        // check if the value has a comma, if so, split it
        if (typeof projectValue === 'string' && projectValue.includes(',')) {
          projectValue.split(',').forEach((val) => uniqueValues.add(val.trim()));
        } else {
          uniqueValues.add(projectValue);
        }
      }
    }
  });

  return Array.from(uniqueValues);
};

export const getFilterOptions = (
  filterName: string,
  allProjects: ProjectDetail[],
  _filteredProjects: ProjectDetail[]
) => {
  const allUniqueValues = getFilterValues(filterName, allProjects);
  // const filteredUniqueValues = getFilterValues(filterName, filteredProjects);

  return allUniqueValues
    .map((value) => ({
      label: value.toString(),
      value,
      //disabled:!filteredUniqueValues.includes(value), // Disable if not in filtered projects
    }))
    .sort((a, b) => {
      return a.label.toString().localeCompare(b.label.toString());
    });
};

export const getFilterOptionsForPoliticalDistricts = (filteredProjects: ProjectDetail[]) => {
  const uniqueValues = new Set<string>();

  filteredProjects.forEach((project) => {
    if (project.districts && project.districts.length > 0) {
      project.districts.forEach((district) => {
        uniqueValues.add(district.trim());
      });
    }
  });

  const districts: { label: string; value: string }[] = [];

  uniqueValues.forEach((value: string) => {
    const district = districtLookup.find((dl) => dl.short_code === value);
    districts.push({
      label: district ? district.long_name : value,
      value,
    });
  });

  return districts.sort((a, b) => a.label.localeCompare(b.label));
};

export const filterProjects = (projects: ProjectDetail[], filters: ActiveFilter[]) => {
  // Group filters by filterName, collecting all values for each filterName
  const groupedFilters: Record<string, (string | number)[]> = filters.reduce(
    (acc, filter) => {
      const values = Array.isArray(filter.value) ? filter.value : [filter.value];
      if (!acc[filter.filterName]) {
        acc[filter.filterName] = [];
      }
      acc[filter.filterName].push(...values);
      return acc;
    },
    {} as Record<string, (string | number)[]>
  );

  return projects.filter((project) => {
    return Object.entries(groupedFilters).every(([filterName, filterValues]) => {
      if (filterValues.length === 0) {
        return true;
      }
      if (filterName.includes('Date')) {
        const dateValue = filterValues[0] as string;
        if (filterName === 'startDate') {
          if (!project.start_date) {
            return false;
          }
          return new Date(project.start_date) >= new Date(dateValue);
        } else if (filterName === 'endDate') {
          if (!project.estimated_actual_completion_date) {
            return false;
          }
          return new Date(project.estimated_actual_completion_date) <= new Date(dateValue);
        }
      }

      if (filterName === 'capitalPlans') {
        return filterValues.some((val) => project.capital_plans.includes(val as string));
      }

      if (filterName === 'phases') {
        return filterValues.some((val) => project.phase === (val as string));
      }

      if (filterName === 'agencies') {
        const agencies = project.agencies ? project.agencies.map((agency) => agency.trim()) : [];
        return filterValues.some((val) => agencies.includes(val as string));
      }

      if (filterName === 'geography') {
        const districts = project.districts
          ? project.districts.map((district) => district.trim())
          : [];
        return filterValues.some((val) => districts.includes(val as string));
      }

      const projectValue = project[filterName as keyof ProjectDetail];
      if (Array.isArray(projectValue)) {
        return filterValues.some((val) => projectValue.includes(val as string));
      }
      return filterValues.some((val) => projectValue === val);
    });
  });
};
