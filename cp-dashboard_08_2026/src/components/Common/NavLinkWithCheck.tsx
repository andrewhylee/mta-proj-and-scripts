import { IconCheck } from '@tabler/icons-react';
import { NavLink } from '@mantine/core';
import styles from './NavLinkWithCheck.module.css';

interface NavLinkWithCheckProps {
  showCheck?: boolean;
  [key: string]: any;
}

export function NavLinkWithCheck({
  showCheck: showCheck,
  isDisabled,
  ...rest
}: NavLinkWithCheckProps) {
  return (
    <NavLink
      {...rest}
      disabled={isDisabled}
      className={showCheck ? styles.selected : ''}
      rightSection={
        showCheck && (
          <IconCheck size="1rem" stroke={1.5} className={`mantine-rotate-rtl ${styles.check}`} />
        )
      }
    />
  );
}
