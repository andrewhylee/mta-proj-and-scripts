import { useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { Button, Divider, Pill, Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import styles from './ActiveFilters.module.css';

export class ActiveFilter {
  filterName: string = '';
  label: string | null = null;
  value: string | null = null;
  allowMultiple: boolean = true;
}

export const activeFiltersAtom = atom<ActiveFilter[]>([]); // Define atom with correct type

export const getActiveFilterByName = (activeFilters: ActiveFilter[], filterName: string) => {
  return activeFilters.filter((filter) => filter.filterName === filterName) || [];
};

export const getValuesForActiveFilter = (activeFilters: ActiveFilter[], filterName: string) => {
  return (getActiveFilterByName(activeFilters, filterName)?.map((f) => f.value) as string[]) || [];
};

export const isActiveFilter = (
  activeFilters: ActiveFilter[],
  filterName: string,
  filterValue: string | number
) => {
  if (filterName.includes('Date')) {
    return activeFilters.some((filter) => filter.filterName === filterName);
  }
  return activeFilters.some(
    (filter) => filter.filterName === filterName && filter.value === filterValue
  );
};

// const contentHeightAtom = atom<number>(0); // Initialize contentHeight atom
// const initContentHeightAtom = atom<number>(0); // Initialize contentHeight variable

export const ActiveFilters = () => {
  const [activeFilters, setActiveFilters] = useAtom<ActiveFilter[]>(activeFiltersAtom);
  const isMobile = useMediaQuery('(max-width: 850px)');
  // const [contentHeight] = useAtom<number>(contentHeightAtom); // Initialize contentHeight atom
  // const [initContentHeight, setInitContentHeight] = useAtom<number>(initContentHeightAtom); // Initialize contentHeight variable
  // useEffect(() => {
  //   const contentElement = document.querySelector('#content') as HTMLElement;
  //   if (contentElement) {
  //     setInitContentHeight(contentElement.offsetHeight);
  //   }
  // }, []);

  useEffect(() => {
    const activeFiltersElement = document.querySelector(`.${styles.filterHeader}`) as HTMLElement;
    if (activeFiltersElement) {
      activeFiltersElement.style.display = activeFilters.length > 0 && isMobile ? 'flex' : 'none';

      // if (activeFilters.length > 0 && contentElement && contentHeight === 0) {
      //   const pillHeaderHeight = activeFiltersElement.offsetHeight;
      //   const contentElement = document.querySelector('#content') as HTMLElement;
      //   // const newHeight = contentElement.offsetHeight - pillHeaderHeight;
      //   // setContentHeight(newHeight);
      //   // contentElement.setAttribute('style', `height: ${newHeight}px`);
      // }

      // if (activeFilters.length === 0 && contentElement) {
      //   // contentElement.setAttribute('style', `height: ${initContentHeight}px`);
      //   // setContentHeight(0); // Reset contentHeight to 0 when no active filters
      // }
    }
  }, [activeFilters]);

  return (
    <div className={styles.filterHeader} id="activeFilters">
      <div className={styles.clearAllButtonContainerMobile}>
        <Button
          className={styles.clearAllButton}
          onClick={() => {
            setActiveFilters([]);
          }}
        >
          Clear All
        </Button>
        <Divider size="xs" orientation="vertical" className={styles.mobileDivider} />
      </div>
      <Stack>
        <Stack>
          <Pill.Group key={activeFilters.map((f) => f.label).join(', ')}>
            {activeFilters.map((filter) => (
              <Pill
                key={filter.label}
                className={styles.filter}
                withRemoveButton
                onRemove={() => {
                  setActiveFilters((prev) => prev.filter((f) => f !== filter));
                }}
              >
                {filter.label}
              </Pill>
            ))}
          </Pill.Group>
        </Stack>
        <div className={styles.clearAllButtonContainer}>
          <Button
            className={styles.clearAllButton}
            onClick={() => {
              setActiveFilters([]);
            }}
          >
            Clear All
          </Button>
        </div>
      </Stack>
    </div>
  );
};
