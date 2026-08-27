import React, { JSX } from 'react';
import { useAtom } from 'jotai';
import { filteredProjectsAtom, ProjectDetail } from '@/data/Helpers/ProjectData';
import { getProjectsForService } from '@/data/Helpers/TransitServiceData';
import { transitServiceModalAtom } from './Modal/TransitServiceModal';
import styles from './TransitServiceColumn.module.css';

export interface TransitServiceItem {
  name: string | JSX.Element;
  serviceLookup?: string;
  icon: React.ReactNode;
  description: string;
}

interface TransitServiceColumnProps {
  serviceGroup: string;
  title: string;
  showTitle?: boolean;
  items: TransitServiceItem[];
  agency: string;
}

const handleMouseOver = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.currentTarget.style.cursor = 'pointer';

  const target = event.currentTarget;
  const lineItemText = target.querySelector(`.${styles.lineItemText}`);
  if (lineItemText) {
    lineItemText.classList.add(styles.lineItemHover);
  }
};

const handleMouseOut = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.currentTarget.style.cursor = 'default';
  const target = event.currentTarget;
  const lineItemText = target.querySelector(`.${styles.lineItemText}`);
  if (lineItemText) {
    lineItemText.classList.remove(styles.lineItemHover);
  }
};

const TransitServiceColumn: React.FC<TransitServiceColumnProps> = ({
  serviceGroup,
  title,
  showTitle = true,
  items,
  agency,
}) => {
  const [, setModalProps] = useAtom(transitServiceModalAtom);
  const [projects] = useAtom(filteredProjectsAtom);

  const handleServiceItemClick = (
    serviceGroup: string,
    title: string,
    item: TransitServiceItem,
    serviceProjects: ProjectDetail[]
  ) => {
    setModalProps({
      opened: true,
      serviceGroup,
      serviceItemDescription: item.description, // Use current item
      service: title,
      serviceItem: item.name,
      serviceItemIcon: item.icon,
      serviceLookup: item.serviceLookup,
      close: () => setModalProps(null),
      projects: serviceProjects,
      agency,
    });
  };

  return (
    <div className={styles.dataColumn}>
      <div className={styles.title} style={{ display: showTitle ? 'block' : 'none' }}>
        {title}
      </div>
      {items.map((item, index) => {
        const service = item.serviceLookup ?? (item.name as string);
        const serviceProjects = getProjectsForService(service, projects);
        const hasNoProjects = serviceProjects.length === 0;
        return (
          <button
            key={index}
            type="button"
            disabled={hasNoProjects}
            className={styles.lineItem}
            onMouseOver={(event) => (!hasNoProjects ? handleMouseOver(event) : null)}
            onMouseOut={(event) => (!hasNoProjects ? handleMouseOut(event) : null)}
            onClick={() => handleServiceItemClick(serviceGroup, title, item, serviceProjects)}
            aria-label={`Open details for ${item.name}`}
            tabIndex={0}
          >
            {item.icon}
            <span className={styles.lineItemText}>{item.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TransitServiceColumn;
