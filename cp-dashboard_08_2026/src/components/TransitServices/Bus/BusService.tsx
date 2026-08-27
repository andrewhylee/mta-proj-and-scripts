import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { filteredProjectsAtom, ProjectDetail } from '@/data/Helpers/ProjectData';
import servicesData from '@/data/services.json';
import { transitServiceModalAtom } from '../Modal/TransitServiceModal';
import { TransitServiceItem } from '../TransitServiceColumn';
import styles from './Bus.module.css';

export const BusIcon: React.FC = () => (
  <div className={styles.icon}>
    <img src="/transit-services/_Buses.svg" alt="Bus" width="100%" height="100%" />
  </div>
);

const busServices: TransitServiceItem[] = [
  { name: 'Brooklyn', icon: <BusIcon />, description: '', serviceLookup: 'NYCT-BK' },
  { name: 'Bronx', icon: <BusIcon />, description: '', serviceLookup: 'NYCT-BX' },
  { name: 'Staten Island', icon: <BusIcon />, description: '', serviceLookup: 'NYCT-SI' },
  { name: 'Queens', icon: <BusIcon />, description: '', serviceLookup: 'NYCT-QN' },
  { name: 'Manhattan', icon: <BusIcon />, description: '', serviceLookup: 'NYCT-MN' },
];

const BusService: React.FC = () => {
  const [filteredProjects] = useAtom(filteredProjectsAtom);
  const [hasBKBuses, setHasBKBuses] = React.useState(false);
  const [hasBXBuses, setHasBXBuses] = React.useState(false);
  const [hasSIBuses, setHasSIBuses] = React.useState(false);
  const [hasQNBuses, setHasQNBuses] = React.useState(false);
  const [hasMNBuses, setHasMNBuses] = React.useState(false);
  const [, setActiveModal] = useAtom(transitServiceModalAtom);

  const title = 'Bus';
  const serviceGroup = 'NYC Transit';

  const handleServiceItemClick = (
    serviceGroup: string,
    title: string,
    item: TransitServiceItem,
    serviceProjects: ProjectDetail[]
  ) => {
    setActiveModal({
      opened: true,
      serviceGroup,
      serviceItemDescription: item.description, // Use current item
      service: title,
      serviceItem: item.name,
      serviceItemIcon: item.icon,
      serviceLookup: item.serviceLookup,
      close: () => setActiveModal(null),
      projects: serviceProjects,
      agency: 'NYCT',
    });
  };

  useEffect(() => {
    busServices.forEach((service) => {
      service.description =
        servicesData.find((s) => s.id === service.serviceLookup)?.description || '';
      service.name = servicesData.find((s) => s.id === service.serviceLookup)?.name || service.name;
    });
  }, []);

  useEffect(() => {
    setHasBKBuses(filteredProjects.some((p) => p.services.includes('NYCT-BK')));
    setHasBXBuses(filteredProjects.some((p) => p.services.includes('NYCT-BX')));
    setHasSIBuses(filteredProjects.some((p) => p.services.includes('NYCT-SI')));
    setHasQNBuses(filteredProjects.some((p) => p.services.includes('NYCT-QN')));
    setHasMNBuses(filteredProjects.some((p) => p.services.includes('NYCT-MN')));
  }, [filteredProjects]);
  return (
    <div className={styles.busDataCard}>
      <div className={styles.busHeader}>
        <span className={styles.title}>Bus</span>
        <span className={styles.buttonGroupTitle}>Select Borough</span>
        <div className={styles.buttonRow}>
          {busServices.map((service, _idx) => {
            const hasService =
              service.serviceLookup === 'NYCT-BK'
                ? hasBKBuses
                : service.serviceLookup === 'NYCT-BX'
                  ? hasBXBuses
                  : service.serviceLookup === 'NYCT-SI'
                    ? hasSIBuses
                    : service.serviceLookup === 'NYCT-QN'
                      ? hasQNBuses
                      : service.serviceLookup === 'NYCT-MN'
                        ? hasMNBuses
                        : false;
            return (
              <button
                key={service.serviceLookup}
                disabled={!hasService}
                type="button"
                className={styles.boroughButton}
                onClick={() =>
                  handleServiceItemClick(
                    serviceGroup,
                    title,
                    service,
                    filteredProjects.filter(
                      (p) =>
                        service.serviceLookup !== undefined &&
                        p.services.includes(service.serviceLookup)
                    )
                  )
                }
              >
                {service.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BusService;
