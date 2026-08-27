'use client';

import { useRouter } from 'next/navigation';
import { Container, NavLink } from '@mantine/core';
import { navigationMenuItems } from '../NavigationMenuItems';
import styles from './NavMenu.module.css';

export function NavMenu({ opened }: { opened: boolean }) {
  const mobileNav = document.getElementById('mobileNav');
  const router = useRouter();

  if (mobileNav) {
    mobileNav.style.display = opened ? 'none' : 'block';
  }

  return (
    <Container
      fluid
      p={0}
      id="mobileNav"
      hiddenFrom="xs"
      style={{ display: opened ? 'block' : 'none' }}
    >
      <nav>
        {navigationMenuItems.map((item) => (
          <NavLink
            key={item.label}
            href={item.path}
            label={item.label}
            className={styles.navLink}
            onClick={(event) => {
              event.preventDefault();
              router.push(item.path);
            }}
          />
        ))}
      </nav>
    </Container>
  );
}
