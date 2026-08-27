'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAtom } from 'jotai';
import { useMediaQuery } from '@mantine/hooks';
import { InitiativeCard, InitiativeCardProps } from '@/components/Initiatives/InitiativeCard';
import cardStyles from '@/components/Initiatives/InitiativeCard.module.css';
import InitiativesModal, { activeModalAtom } from '@/components/Initiatives/Modal/InitiativesModal';
import { filteredProjectsAtom, ProjectDetail } from '@/data/Helpers/ProjectData';
import Layout from '@/Layout';
import styles from './page.module.css';

function InitiativesPage() {
  const [initiatives, setInitiatives] = useState<InitiativeCardProps[]>([]);
  const [projects] = useAtom(filteredProjectsAtom);
  const [modalProps, setModalProps] = useAtom(activeModalAtom);
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState('');
  const [selectedInitiativeDescription, setSelectedInitiativeDescription] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<ProjectDetail[]>([]);
  const [selectedInitiativeIcon, setSelectedInitiativeIcon] = useState<React.ReactNode>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const isMobile = useMediaQuery('(max-width: 850px)');

  const getAndSetInitiatives = async () => {
    const response = await import('@/data/initiatives.json');

    const iconMap: Record<string, React.ReactNode> = {
      Resilience: (
        <img src="initiatives/_Resilience.svg" alt="Resilience" className={cardStyles.icon} />
      ),
      Sustainability: (
        <img
          src="initiatives/_Sustainability.svg"
          alt="Sustainability"
          className={cardStyles.icon}
        />
      ),
      Accessibility: (
        <img src="initiatives/_Accessibility.svg" alt="Accessibility" className={cardStyles.icon} />
      ),
      'Signal Modernization': (
        <img
          src="initiatives/_Signal Modernization.svg"
          alt="Signal Modernization"
          className={cardStyles.icon}
        />
      ),
      Safety: <img src="initiatives/_Safety.svg" alt="Safety" className={cardStyles.icon} />,
      'System Expansion': (
        <img
          src="initiatives/_System Expansion.svg"
          alt="System Expansion"
          className={cardStyles.icon}
        />
      ),
      Reliability: (
        <img src="initiatives/_Reliability.svg" alt="Reliability" className={cardStyles.icon} />
      ),
      'Enabled by Congestion Relief': (
        <img
          src="initiatives/_Congestion Relief.svg"
          alt="Congestion Relief"
          className={cardStyles.icon}
        />
      ),
    };
    const initiatives = (response.default as any[]).map((initiative) => ({
      ...initiative,
      icon: iconMap[initiative.title],
      projects: projects?.filter((project) => project.initiatives.includes(initiative.title)) ?? [],
    })) as InitiativeCardProps[];
    setInitiatives(initiatives);
  };

  useEffect(() => {
    setInitiatives((prev) =>
      prev.map((initiative) => ({
        ...initiative,
        projects: projects.filter((project) => project.initiatives.includes(initiative.title)),
      }))
    );
  }, [projects]);

  useEffect(() => {
    if (modalProps) {
      setModalOpened(modalProps.opened ?? false);
      setSelectedInitiative(modalProps.initiative);
      setSelectedInitiativeDescription(modalProps.initiativeDescription || '');
      setSelectedProjects(modalProps.projects || []);
      setSelectedInitiativeIcon(modalProps.icon || null);
    }
  }, [modalProps]);

  useEffect(() => {
    setModalProps(null);
    getAndSetInitiatives();
  }, []);

  useEffect(() => {
    const item = searchParams.get('item');
    if (item) {
      const found = initiatives.find((i) => i.title === item);
      if (found) {
        setModalProps({
          opened: true,
          initiative: found.title,
          initiativeDescription: found.description,
          projects: found.projects,
          icon: found.icon,
          close: () => setModalProps(null),
        });
      }
    }
  }, [initiatives, searchParams]);

  const handleProjectSelected = (projectId: number) => {
    const projectDetail = projects.find((p) => p.project_id === projectId) || null;
    if (projectDetail) {
      router.push(`/initiatives?projectId=${projectDetail.project_id}&cb=${Date.now()}`);
    }
  };

  return (
    <Layout>
      <InitiativesModal
        opened={modalOpened}
        close={() => {
          setModalOpened(false);
          setModalProps(null);
        }}
        icon={selectedInitiativeIcon}
        initiative={selectedInitiative}
        initiativeDescription={selectedInitiativeDescription}
        projects={selectedProjects}
        handleProjectSelected={handleProjectSelected}
      />
      <div className={styles.initiativesContainer}>
        {initiatives.map((initiative, index) => (
          <InitiativeCard
            key={`initiative.title-${initiative.title}-${index}`}
            title={initiative.title}
            icon={initiative.icon}
            description={initiative.description}
            projects={initiative.projects}
          />
        ))}
        {initiatives.length % (isMobile ? 2 : 3) !== 0 && (
          <button
            type="button"
            style={{ visibility: 'hidden' }}
            className={cardStyles.initiativeCard}
          />
        )}
      </div>
    </Layout>
  );
}

export default function WrappedInitiativesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InitiativesPage />
    </Suspense>
  );
}
