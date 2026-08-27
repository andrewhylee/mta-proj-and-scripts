import React from 'react';
import { IconFilter, IconX } from '@tabler/icons-react';
import { ActionIcon } from '@mantine/core';
import styles from './FilterButton.module.css';

interface FilterButtonProps {
  isOpen: boolean;
  toggleFilter: () => void;
  visibleFrom?: string;
  hiddenFrom?: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  isOpen,
  toggleFilter,
  visibleFrom,
  hiddenFrom,
}) => {
  // const activeFilters = useAtom(activeFiltersAtom)[0];
  const iconSize = 26;
  return (
    <>
      <ActionIcon
        aria-label="Filter"
        className={styles.filterIcon}
        style={{ display: isOpen ? 'none' : 'block' }}
        visibleFrom={visibleFrom}
        hiddenFrom={hiddenFrom}
        onClick={toggleFilter}
      >
        <IconFilter size={iconSize} />
      </ActionIcon>

      <ActionIcon
        aria-label="Close filter"
        className={`${styles.filterIcon} ${styles.exitIcon}`}
        style={{ display: isOpen ? 'block' : 'none' }}
        visibleFrom={visibleFrom}
        hiddenFrom={hiddenFrom}
        onClick={toggleFilter}
      >
        <IconX size={iconSize} />
      </ActionIcon>
    </>
  );
};

export default FilterButton;
