'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import MapLocalityTab from '@/components/Map/Header/MapLocalityTab';
import MapTableToggle from '@/components/Map/Header/MapTableToggle';
import MapComponent from '@/components/Map/Map';
import { ProjectOverviewTable } from '@/components/Project/Table/ProjectOverviewTable';
import Search from '@/components/Search/Search';
import { filteredProjectsAtom, ProjectDetail } from '@/data/Helpers/ProjectData';
import Layout from '@/Layout';
import styles from './page.module.css';

function HomePage() {
  const [isTableSelected, setIsTableSelected] = useState(false);
  const [locality, setLocality] = useState('NYC'); // Default locality
  const [projects] = useAtom(filteredProjectsAtom);
  const [tableProject, setTableProject] = useState<ProjectDetail[]>([]);
  const router = useRouter();

  const handleLocalityChange = (locality: string) => {
    setLocality(locality);
  };

  useEffect(() => {
    const nyctAgency = 'New York City Transit';
    if (locality === 'NYC') {
      setTableProject(projects);
    } else {
      const otherRegionProjects = projects.filter(
        (p) => !(p.agencies.length === 1 && p.agencies[0] === nyctAgency)
      );
      setTableProject(otherRegionProjects);
    }
  }, [projects, locality]);

  const handleMapToggleChangedEvent = (isTable: boolean) => {
    setIsTableSelected(isTable);
  };

  const handleProjectSelected = useCallback(
    (projectId: number) => {
      const projectDetail = projects.find((p) => p.project_id === projectId) || null;

      if (projectDetail) {
        router.push(
          `${window.location.pathname}?projectId=${projectDetail.project_id}&cb=${Date.now()}`
        );
      }
    },
    [projects]
  );
  return (
    <Layout>
      <div className={styles.mapPageContainer}>
        <div
          className={styles.mapHeader}
          style={{ justifyContent: !isTableSelected ? 'space-between' : 'end' }}
        >
          <MapLocalityTab
            localityChangedEvent={handleLocalityChange}
            shouldShow={!isTableSelected}
          />
          <MapTableToggle mapTableToggleChangedEvent={handleMapToggleChangedEvent} />
        </div>
        <div className={styles.mapHeaderMobile}>
          <div className={styles.mapHeaderMobileTop}>
            <Search /> <MapTableToggle mapTableToggleChangedEvent={handleMapToggleChangedEvent} />
          </div>
          <MapLocalityTab
            localityChangedEvent={handleLocalityChange}
            shouldShow={!isTableSelected}
          />
        </div>

        <div className={styles.mapTableContainer}>
          <MapComponent
            key={`mapComponent${tableProject.map((p) => p.project_id).join(',')}=${locality}`}
            locality={locality}
            isVisible={!isTableSelected}
            handleProjectSelected={handleProjectSelected}
            projects={tableProject?.map((p) => p.project_id) || []}
            shouldZoomToProjects={false}
          />

          <ProjectOverviewTable
            key={`projectTable${tableProject.map((p) => p.project_id).join(',')}`}
            isVisible={isTableSelected}
            projectDetails={tableProject}
            handleProjectSelected={handleProjectSelected}
          />
        </div>
      </div>
    </Layout>
  );
}

export default function WrappedHomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
    </Suspense>
  );
}
