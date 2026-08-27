import { useEffect } from 'react';
import {
  IconBuilding,
  IconCalendar,
  IconClock,
  IconFileText,
  IconMapPin,
} from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { NavLink } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import { NavLinkWithCheck } from '@/components/Common/NavLinkWithCheck';
import {
  activeFiltersAtom,
  getActiveFilterByName,
  isActiveFilter,
} from '@/components/Filters/ActiveFilters';
import filters from '@/data/filters.json';
import { filteredProjectsAtom, projectsAtom } from '@/data/Helpers/ProjectData';
import {
  getFilterOptions,
  getFilterOptionsForPoliticalDistricts,
  getLabelForFilter,
} from './Filters';
import styles from './FilterMobile.module.css';

export function FilterMobile({ isOpen }: { isOpen: boolean }) {
  const capitalPlans = filters.find((filter) => filter.name === 'capitalPlans')?.options || [];

  const [filteredProjects] = useAtom(filteredProjectsAtom);
  const [allProjects] = useAtom(projectsAtom);

  const [activeFilters, setActiveFilters] = useAtom(activeFiltersAtom);
  const isMobile = useMediaQuery('(max-width: 850px)') || window.outerWidth < 850;

  const handleFilterChange = (
    event: React.MouseEvent | null,
    filterName: string,
    value: string
  ) => {
    event?.preventDefault();
    const existingFilters = getActiveFilterByName(activeFilters, filterName);
    const existingFilter = existingFilters.find((f) => f.value === value);
    const label = getLabelForFilter(filterName, value) || value;

    if (!existingFilter) {
      setActiveFilters((prev) => [...prev, { filterName, value, label, allowMultiple: true }]);
    } else {
      setActiveFilters((prev) => prev.filter((f) => f !== existingFilter));
    }
  };

  useEffect(() => {
    const mobileFiltersElement = document.querySelector(`.${styles.mobileFilters}`) as HTMLElement;
    const mobileFiltersOverlayElement = document.querySelector(
      `.${styles.mobileFiltersOverlay}`
    ) as HTMLElement;
    if (mobileFiltersElement) {
      mobileFiltersElement.style.display = isOpen && isMobile ? 'block' : 'none';
      if (mobileFiltersOverlayElement) {
        mobileFiltersOverlayElement.style.display = isOpen && isMobile ? 'block' : 'none';
      }
    }
  }, [isOpen]);

  useEffect(() => {
    clearDateInputIfNotActiveFilters('startDate');
    clearDateInputIfNotActiveFilters('endDate');
  }, [activeFilters]);

  const clearDateInputIfNotActiveFilters = (inputId: string) => {
    if (!isActiveFilter(activeFilters, inputId, '')) {
      const inputElement = document.querySelector(`#${inputId}`) as HTMLInputElement;
      if (inputElement) {
        inputElement.value = '';
      }
    }
  };

  return (
    <div className={styles.mobileFilters}>
      <NavLink
        href="#required-for-focus"
        label="Date"
        leftSection={<IconCalendar size={16} stroke={1.5} />}
        childrenOffset={28}
        className={styles.filterTitle}
      >
        <NavLink label="Start Date" href="#startDate=2023-01-01">
          <DateInput
            className={styles.dateInput}
            onChange={(date) => handleFilterChange(null, 'startDate', date ?? '')}
            id="startDate"
            aria-label="Start Date"
          />
        </NavLink>
        <NavLink label="End Date" href="#endDate=2023-12-31">
          <DateInput
            className={styles.dateInput}
            onChange={(date) => handleFilterChange(null, 'endDate', date ?? '')}
            id="endDate"
            aria-label="End Date"
          />
        </NavLink>
      </NavLink>

      <NavLink
        href="#required-for-focus"
        label="Phase"
        leftSection={<IconClock size={16} stroke={1.5} />}
        childrenOffset={28}
        className={styles.filterTitle}
      >
        {getFilterOptions('phase', allProjects, filteredProjects)
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((opt) => ({
            ...opt,
            value: String(opt.value),
          }))
          .map((phase) => (
            <NavLinkWithCheck
              key={phase.value}
              label={phase.label}
              href={`#phases=${phase.value}`}
              showCheck={isActiveFilter(activeFilters, 'phases', phase.value)}
              onClick={(e: React.MouseEvent) => {
                handleFilterChange(e, 'phases', phase.value);
              }}
              // isDisabled={phase.disabled}
            />
          ))}
      </NavLink>
      <NavLink
        href="#required-for-focus"
        label="Geography"
        leftSection={<IconMapPin size={16} stroke={1.5} />}
        childrenOffset={28}
        className={styles.filterTitle}
      >
        {' '}
        {getFilterOptionsForPoliticalDistricts(allProjects)
          .map((opt) => ({
            ...opt,
            value: String(opt.value),
          }))
          .map((geography) => (
            <NavLinkWithCheck
              key={geography.value}
              label={geography.label}
              href=""
              showCheck={isActiveFilter(activeFilters, 'geography', geography.value)}
              onClick={(e: React.MouseEvent) => {
                handleFilterChange(e, 'geography', geography.value);
              }}
            />
          ))}
      </NavLink>
      <NavLink
        href="#"
        label="Agency"
        leftSection={<IconBuilding size={16} stroke={1.5} />}
        childrenOffset={28}
        className={styles.filterTitle}
      >
        {getFilterOptions('agencies', allProjects, filteredProjects)
          .map((opt) => ({
            ...opt,
            value: String(opt.value),
          }))
          .map((agency) => (
            <NavLinkWithCheck
              key={agency.value}
              label={agency.label}
              href=""
              showCheck={isActiveFilter(activeFilters, 'agencies', agency.value)}
              onClick={(e: React.MouseEvent) => {
                handleFilterChange(e, 'agencies', agency.value);
              }}
            />
          ))}
      </NavLink>
      <NavLink
        href="#"
        label="Capital Plan"
        leftSection={<IconFileText size={16} stroke={1.5} />}
        childrenOffset={28}
        className={styles.filterTitle}
      >
        {capitalPlans.map((capitalPlan) => (
          <NavLinkWithCheck
            key={capitalPlan.value}
            label={capitalPlan.label}
            href=""
            showCheck={isActiveFilter(activeFilters, 'capitalPlans', capitalPlan.value)}
            onClick={(e: React.MouseEvent) => {
              handleFilterChange(e, 'capitalPlans', capitalPlan.value.toString());
            }}
          />
        ))}
      </NavLink>
    </div>
  );
}
