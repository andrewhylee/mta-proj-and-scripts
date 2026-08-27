import React, { JSX, useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { LoadingOverlay, UnstyledButton } from '@mantine/core';
import { ProjectOverviewTable } from '@/components/Project/Table/ProjectOverviewTable';
import { convertServicesToItems } from '@/components/TransitServices/BridgesTunnels/BridgesTunnels';
import { SubwayLineIcon } from '@/components/TransitServices/NYCT/NyctServices';
import { RailLineItemBox } from '@/components/TransitServices/RegionalRail/RegionalRail';
import { ProjectDetail } from '@/data/Helpers/ProjectData';
import {
  getTransitServices,
  transitServicesAtom,
  TransitServiceType,
} from '@/data/Helpers/TransitServiceData';
import styles from './ProjectPanel.module.css';

export interface ProjectPanelProps {
  title?: string;
  services?: string;
  isOpen?: boolean;
  close?: () => void;
  projects?: ProjectDetail[];
  handleProjectSelected?: (projectId: number) => void;
}

const ProjectPanel: React.FC<ProjectPanelProps> = ({
  title,
  services,
  isOpen,
  close,
  projects,
  handleProjectSelected,
}) => {
  const [projectsForPanel] = React.useState<ProjectDetail[]>(projects || []);
  const [show, setShow] = useState(isOpen || false);
  const [stationName, setStationName] = useState<string>('');
  const [transitServices, setTransitServices] = useAtom<TransitServiceType[]>(transitServicesAtom);
  const [serviceIcons, setServiceIcons] = useState<JSX.Element[]>([]);

  const fetchTransitServices = async (): Promise<TransitServiceType[]> => {
    const transitServicesList = await getTransitServices();
    setTransitServices(transitServicesList);
    return transitServicesList;
  };

  useEffect(() => {
    if (projectsForPanel.length !== 0) {
      const stationName = title?.split(':')[0] || '';

      setStationName(stationName);
    }
  }, [projectsForPanel]);

  const updateServiceIcons = (servicesArray: string[], transitServices: TransitServiceType[]) => {
    const icons: JSX.Element[] = [];
    servicesArray.forEach((service) => {
      const transitService = transitServices.find((s) => s.id === service);

      if (transitService) {
        if (service.startsWith('NYCT')) {
          icons.push(
            <SubwayLineIcon
              line={transitService?.designation}
              backgroundColor={transitService?.color}
              textColor={transitService?.textColor}
              name={transitService?.name || ''}
            />
          );
        } else if (transitService.agency === 'LIRR' || transitService.agency === 'MNR') {
          icons.push(<RailLineItemBox key={transitService.id} color={transitService.color} />);
        } else if (transitService.agency === 'BT') {
          const bt = convertServicesToItems([transitService]);
          if (bt.length > 0) {
            if (!icons.find((icon) => icon.props.icon === bt[0].icon.props.icon)) {
              icons.push(bt[0].icon);
            }
          }
        }
      }
    });
    setServiceIcons(icons);
  };

  useEffect(() => {
    if (!services || services.length === 0) {
      setServiceIcons([]);
      return;
    }
    const servicesArray = services?.replace(/\s+/g, '').split(',');

    if (transitServices.length === 0) {
      fetchTransitServices().then((fetchedServices) => {
        updateServiceIcons(servicesArray, fetchedServices);
      });
    } else {
      updateServiceIcons(servicesArray, transitServices);
    }
  }, []);

  useEffect(() => {
    setShow(isOpen || false);
  }, [isOpen]);

  return (
    <div
      className={styles.panelContainer}
      id="mapPanel"
      style={{
        transform: show ? 'translateX(0)' : 'translateX(-100%)',
      }}
    >
      <LoadingOverlay
        visible={!projects?.length}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: 'green', type: 'bars' }}
      />
      <div className={styles.panelHeader}>
        <div className={styles.panelHeaderLeftSide}>
          {services && services.length > 0 && services.includes('NYCT') ? (
            <>
              <span className={styles.panelTitle}>{stationName}</span>
              <div className={styles.panelSubtitle}>
                {serviceIcons.length > 0
                  ? serviceIcons.map((icon, index) => (
                      <div key={index} className={styles.serviceIcon}>
                        {icon}
                      </div>
                    ))
                  : ''}
              </div>
            </>
          ) : (
            <div className={styles.panelTitle}>
              {' '}
              {serviceIcons.length > 0
                ? serviceIcons.map((icon, index) => (
                    <div key={index} className={styles.serviceIcon}>
                      {icon}
                    </div>
                  ))
                : ''}
              &nbsp;&nbsp;
              {stationName}
            </div>
          )}
        </div>
        <div className={styles.panelExitButton}>
          <UnstyledButton className={styles.exitButton} onClick={close}>
            &times;
          </UnstyledButton>
        </div>
      </div>
      <div
        className={styles.panelContent}
        style={{ height: '100%', width: '100%', overflow: 'auto' }}
      >
        <ProjectOverviewTable
          isVisible
          projectDetails={projectsForPanel}
          uniqueId="map-panel"
          handleProjectSelected={handleProjectSelected}
          height={250}
        />
      </div>
    </div>
  );
};

export default ProjectPanel;
