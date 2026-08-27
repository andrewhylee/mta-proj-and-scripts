import { useEffect, useState } from 'react';
import { MTALogo } from '../Common/MTALogo';
import Search from '../Search/Search';
import FilterButton from './Filters/FilterButton';
import { NavBurger } from './Navigation/Mobile/NavBurger';
import { Navigation } from './Navigation/Navigation';
import styles from './Header.module.css';

const Header = ({ onFilterOpen }: { onFilterOpen?: (isOpen: boolean) => void }) => {
  const [opened, setIsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const toggleFilter = () => {
    const newFilterState = !filterOpen;
    setFilterOpen(newFilterState);
    if (onFilterOpen) {
      onFilterOpen(newFilterState);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <header className={styles.header}>
        {/* Left Section */}
        <div className={styles.leftSection}>
          <NavBurger opened={opened} setIsOpen={setIsOpen} />
          <Navigation />
          {/* <FilterButton isOpen={filterOpen} toggleFilter={toggleFilter} visibleFrom="sm" /> */}
        </div>

        {/* Center Section */}
        <div className={styles.centerSection}>
          {mounted && typeof window !== 'undefined' && window.location.pathname !== '/' ? (
            <a href="/" className={styles.title}>
              Capital Program Dashboard
            </a>
          ) : (
            <div className={styles.title}>Capital Program Dashboard</div>
          )}
          <div className={styles.beta}>
            <span className={styles.betaText}>BETA</span>
          </div>
          <a href="/">
            <MTALogo hiddenFrom="md" />
          </a>
        </div>
        {/* Right Section */}
        <div className={styles.rightSection}>
          <Search visibleFrom="lg" showFilter={false} />
          <a href="/">
            <MTALogo visibleFrom="lg" />
          </a>
          <FilterButton isOpen={filterOpen} toggleFilter={toggleFilter} hiddenFrom="lg" />
        </div>
      </header>
    </>
  );
};

export default Header;
