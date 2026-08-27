import React from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import { Combobox, Input, InputBase, useCombobox } from '@mantine/core';
import styles from './SearchFilter.module.css';

interface SearchFilterProps {
  onFilterChange?: (filter: string) => void;
  value?: string;
  placeholder?: string;
  showFilter?: boolean;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  onFilterChange,
  value = 'Projects',
  showFilter = true,
}) => {
  const [filterValue, setFilterValue] = React.useState(value);
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  return (
    <Combobox
      onOptionSubmit={(val) => {
        setFilterValue(val as string);
        if (onFilterChange) {
          onFilterChange(val as string);
        }
        combobox.closeDropdown();
      }}
      dropdownPadding={0}
      store={combobox}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          variant="filled"
          pointer
          className={styles.inputBase}
          rightSection={<IconChevronDown size={16} />}
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}
          style={{ display: showFilter ? 'flex' : 'none' }}
          value={filterValue}
        >
          {filterValue || <Input.Placeholder>Search for ...</Input.Placeholder>}
        </InputBase>
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options className={styles.comboboxOptions}>
          {['Projects', 'ACEPs', 'Everything'].map((option) => (
            <Combobox.Option value={option} key={option}>
              {option}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export default SearchFilter;
