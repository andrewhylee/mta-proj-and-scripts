import React, { JSX } from 'react';
import { atom } from 'jotai';
import { Modal, Pill } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import MapComponent from '@/components/Map/Map';
import { ProjectOverviewTable } from '@/components/Project/Table/ProjectOverviewTable';
import { ProjectDetail } from '@/data/Helpers/ProjectData';
import styles from './TransitServiceModal.module.css';

export interface TransitServiceModalProps {
  opened: boolean | undefined;
  close: () => void;
  serviceGroup: string;
  service: string;
  serviceLookup?: string;
  serviceItem: string | JSX.Element;
  serviceItemIcon: React.ReactNode;
  serviceItemDescription?: string;
  projects: ProjectDetail[];
  agency: string;
  handleProjectSelected?: (projectId: number) => void;
}

export const transitServiceModalAtom = atom<TransitServiceModalProps | null>(null);

const TransitServiceModal: React.FC<TransitServiceModalProps> = (props) => {
  const { opened, close, handleProjectSelected, agency } = props;
  const isMobile = useMediaQuery('(max-width: 850px)');

  return (
    <Modal
      opened={opened ?? false}
      onClose={close}
      classNames={{ header: styles.header }}
      size="950px"
      fullScreen={isMobile}
      title={
        <div
          className={styles.title}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span className={styles.serviceGroup}>{props.service}</span>
          <span>|</span>
          <span className={styles.serviceItem}>{props.serviceItem}</span>
        </div>
      }
    >
      <div className={styles.modalContent}>
        <div className={styles.modalContentHeader}>
          <div className={styles.modalContentHeaderLine}>
            <div className={styles.modalContentHeaderIcon}>{props.serviceItemIcon}</div>
            <div>
              <div className={styles.modalContentHeaderTitle}>{props.serviceItem}</div>
            </div>
          </div>
          <div className={styles.modalContentHeaderDescriptionContainer}>
            <div className={styles.modalContentHeaderDescription}>
              {props.serviceItemDescription}
            </div>
            <div className={styles.modalContentHeaderRightSide}>
              <div className={styles.mtaLogoContainer}>
                <object
                  data={`/transit-services/${agency} 2-Line_logo.svg`}
                  type="image/svg+xml"
                  width="100%"
                  height="100%"
                  aria-label="MTA Logo"
                />
              </div>
            </div>
          </div>
          <div className={styles.agenciesContainer}>
            <div className={styles.modalContentHeaderText}>Agencies: </div>
            <div className={styles.agenciesText}>
              <Pill>NYCT</Pill>
            </div>
          </div>
        </div>
        <div className={styles.contentContainer}>
          <div className={styles.modalContentHeaderText}>Project Locations</div>
          <div className={styles.mapContainer}>
            <MapComponent
              isVisible
              projects={props.projects.map((project) => project.project_id)}
              service={props.serviceLookup}
              handleProjectSelected={handleProjectSelected}
            />
          </div>
        </div>
        <div className={styles.contentContainer}>
          <div className={`${styles.modalContentHeaderText} ${styles.projectsTableHeader}`}>
            {props.serviceItem} Projects
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

export default TransitServiceModal;
