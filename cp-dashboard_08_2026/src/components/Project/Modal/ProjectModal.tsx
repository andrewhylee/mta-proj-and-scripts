import React from 'react';
import { atom } from 'jotai';
import { Modal } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ProjectDetail } from '@/data/Helpers/ProjectData';
import ProjectContent from './ProjectContent';
import styles from './ProjectModal.module.css';

export interface ProjectModalProps {
  close: () => void;
  project: ProjectDetail;
  stack: any;
}

export const projectModalAtom = atom<ProjectModalProps | null>(null);

const ProjectModal: React.FC<ProjectModalProps> = (props) => {
  const { close, project, stack } = props;
  const isMobile = useMediaQuery('(max-width: 600px)');

  return (
    <Modal
      {...stack.register('project-details')}
      onClose={close}
      classNames={{ header: styles.header, close: styles.closeButton }}
      size="1000px"
      fullScreen={isMobile}
      title={
        <div className={styles.title}>
          <span className={styles.serviceGroup}>PROJECT</span>
          <span>|</span>
          <span className={styles.serviceItem}>{props.project.title}</span>
        </div>
      }
    >
      <ProjectContent project={project} />
    </Modal>
  );
};

export default ProjectModal;
