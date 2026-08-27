'use client';

import { Dispatch, ReactNode, SetStateAction, useState } from 'react';
import { IconBuilding, IconCategory, IconFileText, IconTag } from '@tabler/icons-react';
import { Button, MultiSelect } from '@mantine/core';
import {
  allUniqueAgencies,
  allUniqueHarmonizedCategories,
  allUniqueNeedsCodes,
  allUniquePlans,
  budgetNames,
  categoriesByAgencies,
} from '@/constants/budget-constants';
import { anyAgency, BudgetFilters } from '@/types/budget-types';
import styles from './BudgetTreemapFilterGrid.module.css';

interface BudgetTreemapFilterGridProps {
  filters: BudgetFilters;
  setFilters: Dispatch<SetStateAction<BudgetFilters>>;
  setNum: Dispatch<SetStateAction<number>>;
}

interface FilterTypeDatum {
  ariaLabel: string;
  leftSection: ReactNode;
  data: string[] | undefined;
  value: string[] | undefined;
  placeholder: string;
  onChangeName: string;
}
const iconSize = 18;

const BudgetTreemapFilterGrid = ({ setFilters, filters, setNum }: BudgetTreemapFilterGridProps) => {
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [selectedNeedsCode, setSelectedNeedsCode] = useState<string[]>([]);
  const [dataOptionsForTypeWhenAgencySelected, setDataOptionsForTypeWhenAgencySelected] = useState<
    string[]
  >(allUniqueHarmonizedCategories);

  const handleClearAllFilters = () => {
    setFilters({
      plan: new Set<string>(),
      agency: new Set<string>(),
      type: new Set<string>(),
      needsCode: new Set<string>(),
    });
    setSelectedPlans([]);
    setSelectedAgency([]);
    setSelectedType([]);
    setSelectedNeedsCode([]);
  };

  const handleSelectChange = (name: string, values: string[] | undefined) => {
    if (values && values.length > 0) {
      // Adds or Removes the recent value
      setFilters((prev) => ({
        ...prev,
        [name]: new Set(values),
      }));
      switch (name) {
        case 'plan':
          setSelectedPlans(values);
          break;
        case 'agency':
          setSelectedAgency(values);
          break;
        case 'type':
          setSelectedType(values);
          break;
        case 'needsCode':
          setSelectedNeedsCode(values);
          break;
      }
    } else {
      // Clear all filters for this name
      setFilters((prev) => ({ ...prev, [name]: new Set() }));
      switch (name) {
        case 'plan':
          setSelectedPlans([]);
          break;
        case 'agency':
          setSelectedAgency([]);
          break;
        case 'type':
          setSelectedType([]);
          break;
        case 'needsCode':
          setSelectedNeedsCode([]);
          break;
      }
    }
    /** Limits the type options based on selected agencies */
    if (name === budgetNames.AGENCY) {
      // if 'agency' chosen
      if (values?.length) {
        let selectedAgenciesCategories: string[] = [];
        for (const agency of values as anyAgency[]) {
          selectedAgenciesCategories = selectedAgenciesCategories.concat(
            categoriesByAgencies[agency]
          );
        }
        setDataOptionsForTypeWhenAgencySelected([...new Set(selectedAgenciesCategories)]);
      } else if (!values || values.length === 0) {
        setDataOptionsForTypeWhenAgencySelected(allUniqueHarmonizedCategories);
      }
    }
    setNum((prev) => prev + 1);
  };

  const filterTypeData: FilterTypeDatum[] = [
    {
      ariaLabel: 'capital plan',
      leftSection: <IconFileText size={iconSize} />,
      data: allUniquePlans,
      value: selectedPlans,
      placeholder: 'Select capital plan',
      onChangeName: 'plan',
    },
    {
      ariaLabel: 'agency',
      leftSection: <IconBuilding size={iconSize} />,
      data: allUniqueAgencies,
      value: selectedAgency,
      placeholder: 'Select agency',
      onChangeName: 'agency',
    },
    {
      ariaLabel: 'type', // variation of "categories" info
      leftSection: <IconCategory size={iconSize} />,
      data: dataOptionsForTypeWhenAgencySelected, // dropdown options for this filter is dynamic, hence "dataOptionsForTypeWhenAgencySelected" instead of "allUniqueHarmonizedCategories"
      value: selectedType,
      placeholder: 'Select type',
      onChangeName: 'type',
    },
    {
      ariaLabel: 'needs code',
      leftSection: <IconTag size={iconSize} />,
      data: allUniqueNeedsCodes,
      value: selectedNeedsCode,
      placeholder: 'Select needs code',
      onChangeName: 'needsCode',
    },
  ];

  return (
    <div className={styles.filterGrid}>
      {filterTypeData.map((filterType, i) => {
        return (
          <MultiSelect
            key={i}
            clearable
            aria-label={filterType.ariaLabel}
            className={styles.input}
            leftSection={filterType.leftSection}
            data={filterType.data}
            value={filterType.value}
            placeholder={
              filters[filterType.onChangeName as keyof BudgetFilters].size === 0
                ? filterType.placeholder
                : undefined
            }
            onChange={(values) => handleSelectChange(filterType.onChangeName, values)}
          />
        );
      })}
      {filters.plan.size + filters.agency.size + filters.type.size + filters.needsCode.size > 0 && (
        <Button variant="outline" className={styles.clearAllButton} onClick={handleClearAllFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default BudgetTreemapFilterGrid;
