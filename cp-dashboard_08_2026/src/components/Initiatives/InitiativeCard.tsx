import { FC, JSX, ReactNode, useEffect } from 'react';
import { useAtom } from 'jotai';
import { ProjectDetail } from '@/data/Helpers/ProjectData';
import { activeModalAtom } from './Modal/InitiativesModal';
import styles from './InitiativeCard.module.css';

export interface InitiativeCardProps {
  title: string;
  icon: ReactNode;
  description: string;
  projects: ProjectDetail[];
}

export const InitiativeCard: FC<InitiativeCardProps> = (props): JSX.Element => {
  const [, setModalProps] = useAtom(activeModalAtom);

  useEffect(() => {
    let cursorStyle = 'pointer';
    if (!props.projects || props.projects.length === 0) {
      cursorStyle = 'default';
    }
    document
      .getElementById(`initiative-card-button-${props.title}`)
      ?.style.setProperty('cursor', cursorStyle);
  }, [props.projects]);

  const handleClick = () => {
    if (props.projects.length === 0) {
      return;
    }

    setModalProps({
      opened: true,
      initiative: props.title,
      initiativeDescription: props.description,
      projects: props.projects,
      close: () => setModalProps(null),
      icon: props.icon,
    });
  };

  return (
    <button
      type="button"
      className={styles.initiativeCard}
      onClick={handleClick}
      aria-label={`Open details for ${props.title}`}
      id={`initiative-card-button-${props.title}`}
    >
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <div className={styles.iconContainer}>{props.icon}</div>
          <div className={styles.title}>{props.title}</div>
        </div>
        <div className={styles.description}>{props.description}</div>
      </div>
      <div className={styles.cardFooter} style={{ marginTop: 'auto' }}>
        <div className={styles.footerItem}>
          Projects: <span className={styles.buttonValue}>{props.projects.length}</span>
        </div>
      </div>
    </button>
  );
};
