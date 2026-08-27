'use client';

import Link from 'next/link';
import { IconCircleArrowUp } from '@tabler/icons-react';
import { Center, NavLink, Text } from '@mantine/core';
import { MTALogo } from '../Common/MTALogo';
import styles from './Footer.module.css';


export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.linksGroup}>
          <div className={styles.footerLine}>
            <div className={styles.footerCol}>
              <Link
                href="https://future.mta.info/capitalplan"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read the Plan
              </Link>
            </div>
            <div className={styles.footerCol}>
              <Link
                href="https://www.mta.info/dashboardupdate"
                target="_blank"
                rel="noopener noreferrer"
              >
                About the Data
              </Link>
            </div>
            <div className={styles.footerCol}>
              <Link
                href="https://www.mta.info/contact-us"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className={styles.footerLine}>
            <div className={styles.footerCol}>
              <Link
                href="https://data.ny.gov/browse?tags=capital+dashboard&sortBy=relevance&pageSize=20"
                target="_blank"
                rel="noopener noreferrer"
              >
                Export Data
              </Link>
            </div>
            <div className={styles.footerCol}>
              <Link href="/">Project Map and Table</Link>
            </div>
            <div className={styles.footerCol}>
              <Link href="/budget-overview">Budget Overview</Link>
            </div>
          </div>

          <div className={styles.footerLine}>
            {/* <div className={styles.footerCol}>
              <Link href="/program-performance">Program Performance</Link>
            </div> */}
            <div className={styles.footerCol}>
              <Link href="/initiatives">Initiatives</Link>
            </div>
            <div className={styles.footerCol}>
              <Link href="/transit-services">Transit Services</Link>
            </div>
            <div className={styles.footerCol}>
              <Link href="https://forms.office.com/g/HZg9xv1qWU" target="_blank">
                Feedback Form
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.stackAndCenter}>
          <div className={styles.backToTopParent}>
            <NavLink
              label="Back to Top"
              className={styles.backToTop}
              rightSection={<IconCircleArrowUp size={20} />}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          </div>
          <MTALogo visibleFrom="md" />
        </div>
      </div>
      <div className={styles.footerMobile}>
        <div className={styles.mobileLink}>
          <Link
            href="https://future.mta.info/capitalplan"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the Plan
          </Link>
        </div>
        <div className={styles.dividerDiv}>
          <svg
            className={styles.divider}
            xmlns="http://www.w3.org/2000/svg"
            width="2"
            height="18"
            viewBox="0 0 2 18"
            fill="white"
          >
            <path d="M1 0V18" stroke="white" />
          </svg>
        </div>
        <div className={styles.mobileLink}>
          <Link
            href="https://www.mta.info/dashboardupdate"
            target="_blank"
            rel="noopener noreferrer"
          >
            About the Data
          </Link>
        </div>
        <div className={styles.dividerDiv}>
          <svg
            className={styles.divider}
            xmlns="http://www.w3.org/2000/svg"
            width="2"
            height="18"
            viewBox="0 0 2 18"
            fill="white"
          >
            <path d="M1 0V18" stroke="white" />
          </svg>
        </div>
        <div className={styles.mobileLink}>
          <Link href="https://www.mta.info/contact-us" target="_blank" rel="noopener noreferrer">
            Contact
          </Link>
        </div>
      </div>
      <Center>
        <Text className={styles.mobileTitle}>Capital Program Dashboard</Text>
      </Center>
    </footer>
  );
}