import React, { ReactNode, useEffect, useState } from 'react';
import { atom } from 'jotai';
import { Modal, Pill } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import MapComponent from '@/components/Map/Map';
import { ProjectOverviewTable } from '@/components/Project/Table/ProjectOverviewTable';
import { ProjectDetail } from '@/data/Helpers/ProjectData';
import styles from './InitiativesModal.module.css';

export interface InitiativesModalProps {
  opened: boolean | undefined;
  close: () => void;
  initiative: string;
  icon: ReactNode;
  initiativeDescription?: string;
  projects: ProjectDetail[];
  handleProjectSelected?: (projectId: number) => void;
}

export const activeModalAtom = atom<InitiativesModalProps | null>(null);

const InitiativesModal: React.FC<InitiativesModalProps> = (props) => {
  const { opened, close, handleProjectSelected } = props;
  const isMobile = useMediaQuery('(max-width: 850px)');
  const [agencies, setAgencies] = useState<Set<string>>(new Set());
  const [iconWithClass, setIconWithClass] = useState<ReactNode>(null);

  useEffect(() => {
    if (!props.projects || props.projects.length === 0) {
      return;
    }
    const agencySet = new Set<string>();

    props.projects.forEach((project) => {
      project.agencies?.forEach((agency) => {
        agencySet.add(agency.trim());
      });
    });
    setAgencies(agencySet);
  }, [props.projects]);

  useEffect(() => {
    if (!props.icon) {
      return;
    }
    if (React.isValidElement(props.icon)) {
      // Clone the icon and set its className
      const iconWithClass = React.cloneElement(props.icon as React.ReactElement<HTMLElement>, {
        className: styles.modalContentHeaderIcon,
      });
      setIconWithClass(iconWithClass);
    }
  }, [props.icon]);

  return (
    <Modal
      opened={opened ?? false}
      onClose={close}
      classNames={{ header: styles.header }}
      size="950px"
      fullScreen={isMobile}
      title={
        <div className={styles.title}>
          <span style={{ fontWeight: 450, marginRight: '4px' }}>initiatives&nbsp;|</span>
          <span style={{ fontWeight: 700 }}>{props.initiative}</span>
        </div>
      }
    >
      <div className={styles.modalContent}>
        <div className={styles.modalContentHeader}>
          <div className={styles.modalContentHeaderLine}>
            <div className={styles.modalContentHeaderIcon}>{iconWithClass}</div>
            <div className={styles.modalContentHeaderTitle}>{props.initiative}</div>
          </div>
          <div className={styles.modalContentHeaderDescriptionContainer}>
            <div className={styles.modalContentHeaderDescription}>
              {props.initiativeDescription}
            </div>
          </div>
          <div className={styles.agenciesContainer}>
            <div className={styles.modalContentHeaderText}>Agencies: </div>
            <div className={styles.pillContainer}>
              {Array.from(agencies).map((agency) => (
                <Pill key={agency} className={styles.pill}>
                  {agency}
                </Pill>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.contentContainer}>
          <div className={styles.modalContentHeaderText}>Project Locations</div>
          <div className={styles.mapContainer}>
            <MapComponent
              isVisible
              projects={props.projects.map((project) => project.project_id)}
              handleProjectSelected={handleProjectSelected}
            />
          </div>
        </div>
        <div className={styles.contentContainer}>
          <div className={`${styles.modalContentHeaderText} ${styles.projectsTableHeader}`}>
            {props.initiative} Projects
          </div>
          <div>
            <ProjectOverviewTable
              isVisible
              projectDetails={props.projects}
              handleProjectSelected={handleProjectSelected}
              height={400}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InitiativesModal;
