'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { IconChevronDown } from '@tabler/icons-react';
import { Combobox, Input, InputBase, useCombobox } from '@mantine/core';
import { navigationMenuItems } from './NavigationMenuItems';
import styles from './Navigation.module.css';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    // Match the URL path with the navigation menu items
    const path = pathname;
    const matchedValue = navigationMenuItems.find(
      (item) => item.path.toLowerCase().replace(/\s+/g, '-') === path.toLowerCase()
    );
    if (matchedValue) {
      setValue(matchedValue.label);
    } else if (path.indexOf('/project/') === 0) {
      setValue('Project Details');
    } else if (path.indexOf('/acep') === 0) {
      setValue('ACEP Details');
    }
  }, [pathname]);

  const options = navigationMenuItems.map((item) => (
    <Combobox.Option
      value={item.label as string}
      key={item.label as string}
      className={styles.comboboxOption}
      data-selected={item.label === value ? true : undefined}
    >
      {item.label as string}
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        setValue(val as string);
        router.push(navigationMenuItems.find((item) => item.label === val)?.path || '');
        combobox.closeDropdown();
      }}
      dropdownPadding={0}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          variant="filled"
          pointer
          className={styles.inputBase}
          rightSection={<IconChevronDown />}
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}
          visibleFrom="xs"
          aria-haspopup="listbox"
          aria-expanded={combobox.dropdownOpened}
          aria-controls="navigation-combobox-list"
          aria-label={value || 'Pick value'}
        >
          {value || <Input.Placeholder>Pick value</Input.Placeholder>}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options key={value} className={styles.comboboxOptions}>
          {options}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
