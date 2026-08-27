'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { atom, useAtom } from 'jotai';
import { Modal, ModalStack, Overlay, useModalsStack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ActiveFilters, activeFiltersAtom } from './components/Filters/ActiveFilters';
import FilterGrid from './components/Filters/FilterGrid';
import { FilterMobile } from './components/Filters/FilterMobile';
import { filterProjects } from './components/Filters/Filters';
import { Footer } from './components/Footer/Footer';
import Header from './components/Header/Header';
import AcepModal from './components/Project/Acep/AcepModal';
import ProjectModal from './components/Project/Modal/ProjectModal';
import { cacheAtom, loadCacheItems } from './data/Helpers/CacheHelper';
import {
  fetchProjects,
  filteredProjectsAtom,
  ProjectDetail,
  projectsAtom,
} from './data/Helpers/ProjectData';
import styles from './components/Filters/FilterMobile.module.css';

const betaModalAtom = atom<boolean>(false);

function Layout({ children }: { children: ReactNode }) {
  const [filterOpen, setFilterOpen] = useState(false);
  const handleFilterOpen = (isOpen: boolean) => {
    setFilterOpen(isOpen);
  };

  const [projects, setProjects] = useAtom(projectsAtom);
  const [, setFilteredProjects] = useAtom(filteredProjectsAtom);
  const [activeFilters] = useAtom(activeFiltersAtom);
  const pathname = usePathname();
  const isMobile = typeof window !== 'undefined' && window.outerWidth < 850; //useMediaQuery('(max-width: 850px)') ;

  const searchParams = useSearchParams();
  const [selectedAcep, setSelectedAcep] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [modalShown, setModalShown] = useAtom(betaModalAtom);
  const [cacheItems, setCacheItems] = useAtom(cacheAtom);
  const stack = useModalsStack(['acep', 'project-details']);

  const filterAndSetProjects = (projects: any[], filters: any[]) => {
    const filtered = filterProjects(projects, filters);
    setFilteredProjects(filtered);
  };

  useEffect(() => {
    if (pathname.indexOf('/budget-overview') !== -1 || isMobile) {
      setFilterOpen(false);
    } else {
      setFilterOpen(true);
    }

    if (!cacheItems || cacheItems.length === 0) {
      loadCacheItems().then((items) => {
        setCacheItems(items);
      });
    }

    if (modalShown === false) {
      open();
      setModalShown(true);
    }

    fetchProjects().then((projects) => {
      setProjects(projects);
      filterAndSetProjects(projects, activeFilters);
    });
  }, []);

  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId) {
      const found = projects.find((i) => i.project_id === Number(projectId));

      if (found) {
        setSelectedProject(found);
        stack.open('project-details');
      }
    } else if (searchParams.has('acepId')) {
      const acepId = searchParams.get('acepId');
      if (acepId) {
        setSelectedAcep(acepId);
        stack.open('acep');
      }
    }
  }, [projects, searchParams]);

  useEffect(() => {
    filterAndSetProjects(projects, activeFilters);
  }, [activeFilters]);

  return (
    <div className="pageContainer">
      <Header onFilterOpen={handleFilterOpen} />

      <Modal
        title="Beta Version"
        opened={opened}
        onClose={close}
        size="lg"
        classNames={{
          header: 'betaModalHeader',
          body: 'betaModalContent',
          close: 'betaModalClose',
        }}
        centered
      >
        You're viewing the beta version of our new Capital Program Dashboard. This version contains
        all ADA projects active in construction and 2025-2029 Capital Plan Projects in the
        procurement pipeline or where locations are known. More projects and features coming soon.
      </Modal>

      <div className="banner">
        <span>
          Beta Version: read&nbsp;
          <a
            href="https://www.mta.info/article/behind-capital-program-dashboard-part-1-look-back"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
          &nbsp;for more info or view the Classic Dashboard&nbsp;
          <a
            href="http://web.mta.info/capitaldashboard/CPDHome.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
        </span>
      </div>
      <ActiveFilters />
      <FilterGrid isOpen={filterOpen} />
      <main className="content" id="content">
        {isMobile && filterOpen && (
          <Overlay className={styles.mobileFiltersOverlay} backgroundOpacity={1}>
            <FilterMobile isOpen={filterOpen} />
          </Overlay>
        )}

        {children}
      </main>
      <ModalStack>
        <ProjectModal
          stack={stack}
          close={() => {
            stack.close('project-details');
          }}
          key={selectedProject?.project_id ?? 'empty'}
          project={selectedProject ?? ({} as ProjectDetail)}
        />
        <AcepModal
          stack={stack}
          close={() => {
            stack.close('acep');
          }}
          acep={selectedAcep || ''}
        />
      </ModalStack>
      <Footer />
    </div>
  );
}

export default Layout;
