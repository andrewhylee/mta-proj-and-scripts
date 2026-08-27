import { useCallback, useEffect, useState } from 'react';
import {
  IconBuilding,
  IconCalendar,
  IconClock,
  IconFileText,
  IconMapPin,
} from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { Button, Group, MultiSelect } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import { activeFiltersAtom, getValuesForActiveFilter } from '@/components/Filters/ActiveFilters';
import filters from '@/data/filters.json';
import { filteredProjectsAtom, projectsAtom } from '@/data/Helpers/ProjectData';
import {
  getFilterOptions,
  getFilterOptionsForPoliticalDistricts,
  getLabelForFilter,
} from './Filters';
import styles from './FilterGrid.module.css';

const FilterGrid = ({ isOpen = false }: { isOpen?: boolean }) => {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useAtom(activeFiltersAtom);
  const [filteredProjects] = useAtom(filteredProjectsAtom);
  const [allProjects] = useAtom(projectsAtom);
  const isMobile = useMediaQuery('(max-width: 850px)');

  useEffect(() => {
    const filterGridElement = document.querySelector(`.${styles.filterGrid}`) as HTMLElement;

    if (filterGridElement) {
      filterGridElement.style.display = isOpen && !isMobile ? 'grid' : 'none';
    }
  }, [isOpen]);

  useEffect(() => {
    const activeFiltersElement = document.querySelector(`.${styles.filterHeader}`) as HTMLElement;

    if (activeFiltersElement) {
      activeFiltersElement.style.display = activeFilters.length > 0 ? 'flex' : 'none';
    }
  }, [activeFilters]);

  useEffect(() => {
    if (startDate) {
      setActiveFilters((prev) => [
        ...prev,
        { filterName: 'startDate', label: startDate, value: startDate, allowMultiple: false },
      ]);
    } else {
      setActiveFilters((prev) => prev.filter((filter) => filter.filterName !== 'startDate'));
    }
  }, [startDate]);

  useEffect(() => {
    if (endDate) {
      setActiveFilters((prev) => [
        ...prev,
        { filterName: 'endDate', label: endDate, value: endDate, allowMultiple: false },
      ]);
    } else {
      setActiveFilters((prev) => prev.filter((filter) => filter.filterName !== 'endDate'));
    }
  }, [endDate]);

  const handleSelectChange = (name: string, values: string[] | undefined) => {
    if (values) {
      setActiveFilters((prev) => prev.filter((filter) => filter.filterName !== name));

      values.forEach((value) => {
        const label = getLabelForFilter(name, value);
        setActiveFilters((prev) =>
          prev.concat({ filterName: name, label: label ?? value, value, allowMultiple: true })
        );
      });
    } else {
      setActiveFilters((prev) => prev.filter((filter) => filter.filterName !== name));
    }
  };

  const filterAndSetAsString = (filterName: string) => {
    return (filters.find((filter) => filter.name === filterName)?.options || []).map((opt) => ({
      ...opt,
      value: String(opt.value),
    }));
  };

  const getValuesForActiveFiltersByName = useCallback(
    (filterName: string) => {
      return getValuesForActiveFilter(activeFilters, filterName);
    },
    [activeFilters]
  );

  useEffect(() => {
    if (activeFilters.length > 0) {
      const startDateFilter = activeFilters.find((f) => f.filterName === 'startDate');
      if (startDateFilter) {
        setStartDate(startDateFilter.value);
      }
      const endDateFilter = activeFilters.find((f) => f.filterName === 'endDate');
      if (endDateFilter) {
        setEndDate(endDateFilter.value);
      }
    }
  }, []);

  const handleClearFilters = () => {
    setActiveFilters([]);
    setStartDate(null);
    setEndDate(null);
  };

  const iconSize = 18;

  return (
    <>
      <Group gap="md" className={styles.filterGrid}>
        <div className={styles.dateInputsContainer}>
          <DateInput
            className={styles.input}
            clearable
            w={138}
            leftSection={startDate ? null : <IconCalendar size={iconSize} />}
            value={startDate}
            onChange={setStartDate}
            placeholder="Start Date"
            valueFormat="MM/DD/YYYY"
          />
          <span style={{ fontSize: '12px' }}>to</span>
          <DateInput
            clearable
            className={styles.input}
            w={138}
            leftSection={endDate ? null : <IconCalendar size={iconSize} />}
            value={endDate}
            onChange={setEndDate}
            placeholder="End Date"
            valueFormat="MM/DD/YYYY"
          />
        </div>

        <MultiSelect
          clearable
          aria-label="phase"
          className={styles.input}
          leftSection={<IconClock size={iconSize} />}
          data={getFilterOptions('phase', allProjects, filteredProjects).map((opt) => ({
            ...opt,
            value: String(opt.value),
          }))}
          value={getValuesForActiveFiltersByName('phases')}
          placeholder={
            getValuesForActiveFiltersByName('phases').length === 0 ? 'Select phase' : undefined
          }
          onChange={(values) => handleSelectChange('phases', values)}
        />
        <MultiSelect
          clearable
          aria-label="geography"
          className={styles.input}
          leftSection={<IconMapPin size={iconSize} />}
          data={getFilterOptionsForPoliticalDistricts(allProjects)}
          value={getValuesForActiveFiltersByName('geography')}
          placeholder={
            getValuesForActiveFiltersByName('geography').length === 0
              ? 'Select geography'
              : undefined
          }
          onChange={(values) => handleSelectChange('geography', values)}
        />
        <MultiSelect
          clearable
          aria-label="agency"
          className={styles.input}
          leftSection={<IconBuilding size={iconSize} />}
          data={getFilterOptions('agencies', allProjects, filteredProjects).map((opt) => ({
            ...opt,
            value: String(opt.value),
          }))}
          value={getValuesForActiveFiltersByName('agencies')}
          placeholder={
            getValuesForActiveFiltersByName('agencies').length === 0 ? 'Select agency' : undefined
          }
          onChange={(values) => handleSelectChange('agencies', values)}
        />
        <MultiSelect
          clearable
          aria-label="capital plan"
          className={styles.input}
          leftSection={<IconFileText size={iconSize} />}
          data={filterAndSetAsString('capitalPlans')}
          value={getValuesForActiveFiltersByName('capitalPlans')}
          placeholder={
            getValuesForActiveFiltersByName('capitalPlans').length === 0
              ? 'Select capital plan'
              : undefined
          }
          onChange={(values) => handleSelectChange('capitalPlans', values)}
        />
        {activeFilters.length > 0 && (
          <Button variant="outline" className={styles.clearAllButton} onClick={handleClearFilters}>
            Clear Filters
          </Button>
        )}
      </Group>
    </>
  );
};

export default FilterGrid;
