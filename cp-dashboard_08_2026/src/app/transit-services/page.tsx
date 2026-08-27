'use client';

import { JSX, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAtom } from 'jotai';
import { Accordion } from '@mantine/core';
import PaginatedList from '@/components/Common/PaginatedList';
import BridgesTunnels, {
  bridgeServicesAtom,
  convertServicesToItems,
  generateBridgeTunnelIcon,
  tunnelServicesAtom,
} from '@/components/TransitServices/BridgesTunnels/BridgesTunnels';
import BusService, { BusIcon } from '@/components/TransitServices/Bus/BusService';
import MobileServiceAccordion from '@/components/TransitServices/MobileServiceAccordion';
import TransitServiceModal, {
  transitServiceModalAtom,
} from '@/components/TransitServices/Modal/TransitServiceModal';
import NyctServices, {
  subwayItemsAtom,
  SubwayLineIcon,
} from '@/components/TransitServices/NYCT/NyctServices';
import RegionalRail, {
  lirrItemsAtom,
  mnrItemsAtom,
  RailLineItemBox,
} from '@/components/TransitServices/RegionalRail/RegionalRail';
import {
  TransitServiceCard,
  TransitServiceCardProps,
} from '@/components/TransitServices/TransitServiceCard/TransitServiceCard';
import TransitServiceColumn from '@/components/TransitServices/TransitServiceColumn';
import { filteredProjectsAtom, ProjectDetail } from '@/data/Helpers/ProjectData';
import {
  getProjectCountForTransitService,
  getProjectsForService,
  getTransitServices,
  transitServicesAtom,
  TransitServiceType,
} from '@/data/Helpers/TransitServiceData';
import Layout from '@/Layout';
import styles from './page.module.css';

function TransitServicePage() {
  const [transitServices, setTransitServices] = useState<TransitServiceCardProps[]>([]);
  const [activeModal, setActiveModal] = useAtom(transitServiceModalAtom);
  const [filteredProjects] = useAtom<ProjectDetail[]>(filteredProjectsAtom);
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [selectedServiceGroup, setSelectedServiceGroup] = useState('');
  const [selectedServiceItem, setSelectedServiceItem] = useState<JSX.Element | string>('');
  const [selectedServiceItemIcon, setSelectedServiceItemIcon] = useState<React.ReactNode>(null);
  const [selectedServiceItemDescription, setSelectedServiceItemDescription] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<ProjectDetail[]>([]);
  const [selectedServiceLookup, setSelectedServiceLookup] = useState<string>('');
  const [services, setServices] = useAtom(transitServicesAtom);
  const [bridgeServices] = useAtom(bridgeServicesAtom);
  const [tunnelServices] = useAtom(tunnelServicesAtom);
  const [lirrItems] = useAtom(lirrItemsAtom);
  const [mnrItems] = useAtom(mnrItemsAtom);
  const [subwayItems] = useAtom(subwayItemsAtom);
  const [bridgeItems, setBridgeItems] = useState<
    { name: string; description: string; icon: JSX.Element }[]
  >([]);
  const [tunnelItems, setTunnelItems] = useState<
    { name: string; description: string; icon: JSX.Element }[]
  >([]);
  const [bridgesTunnelsProjectCount, setBridgesTunnelsProjectCount] = useState(0);
  const [regionalRailProjectCount, setRegionalRailProjectCount] = useState(0);
  const [nyctProjectCount, setNyctProjectCount] = useState(0);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const getAgencyData = async () => {
    const response = await import('@/data/transit-services.json');

    const transitServiceData = response.default.map((service) => ({
      title: service.category,
      description: service.description,
      projectCount: 0,
    })) as TransitServiceCardProps[];

    setTransitServices(transitServiceData);
  };

  useEffect(() => {
    setBridgeItems(convertServicesToItems(bridgeServices));
    setTunnelItems(convertServicesToItems(tunnelServices));
    setBridgesTunnelsProjectCount(
      getProjectCountForTransitService(
        [...bridgeServices, ...tunnelServices].map((item) => item.id),
        filteredProjects
      )
    );
  }, [bridgeServices, tunnelServices, filteredProjects]);

  useEffect(() => {
    setRegionalRailProjectCount(
      getProjectCountForTransitService(
        [...lirrItems, ...mnrItems].map((item) => item.serviceLookup as string),
        filteredProjects
      )
    );
  }, [lirrItems, mnrItems, filteredProjects]);

  useEffect(() => {
    setNyctProjectCount(
      getProjectCountForTransitService(
        subwayItems.map((item) => (item.serviceLookup || item.name) as string),
        filteredProjects
      )
    );
  }, [subwayItems, filteredProjects]);

  useEffect(() => {
    if (activeModal) {
      setModalOpened(activeModal.opened ?? false);
      setSelectedService(activeModal.service);
      setSelectedServiceGroup(activeModal.serviceGroup);
      setSelectedServiceItem(activeModal.serviceItem);
      setSelectedServiceItemIcon(activeModal.serviceItemIcon);
      setSelectedServiceItemDescription(activeModal.serviceItemDescription || '');
      setSelectedProjects(activeModal.projects || []);
      setSelectedServiceLookup(activeModal.serviceLookup || '');
      setSelectedAgency(activeModal.agency || null);
    }
  }, [activeModal]);

  useEffect(() => {
    setActiveModal(null);
    getAgencyData();
    getTransitServices().then((services) => {
      setServices(services);
    });
  }, []);

  const getService = (item: TransitServiceType) => {
    if (item.id.startsWith('NYCT')) {
      return item.name.includes('Bus') ? 'Bus' : 'Subway Service';
    } else if (item.id.startsWith('LIRR')) {
      return 'Long Island Rail Road';
    } else if (item.id.startsWith('MNR')) {
      return 'Metro-North Railroad';
    } else if (item.id.startsWith('BT')) {
      return 'Bridges and Tunnels';
    }
  };

  const getServiceIcon = (item: TransitServiceType) => {
    if (item.id.startsWith('NYCT')) {
      if (item.name.includes('Bus')) {
        return <BusIcon />;
      }
      return (
        <SubwayLineIcon
          line={item.designation}
          name={item.name}
          backgroundColor={item.color}
          textColor={item.textColor}
        />
      );
    } else if (item.id.startsWith('LIRR') || item.id.startsWith('MNR')) {
      return <RailLineItemBox key={item.name} color={item.color} />;
    } else if (item.id.startsWith('BT')) {
      return generateBridgeTunnelIcon(item.name);
    }
  };

  useEffect(() => {
    const item = searchParams.get('item');
    if (item) {
      const found = services.find((s) => s.name === item);
      if (found) {
        setActiveModal({
          opened: true,
          service: getService(found) || '',
          serviceGroup: '',
          serviceItem: found.name || '',
          serviceItemIcon: getServiceIcon(found) || null,
          serviceItemDescription: found.description || '',
          projects: getProjectsForService(found.id, filteredProjects),
          serviceLookup: found.id,
          agency: found.agency || '',
          close: () => setActiveModal(null),
        });
      }
    }
  }, [services, searchParams]);

  const subwayPageSlices: {
    page: number;
    col1: [number, number];
    col2: [number, number];
    col3: [number, number];
  }[] = [
    {
      page: 1,
      col1: [0, 3],
      col2: [3, 7],
      col3: [7, 10],
    },
    {
      page: 2,
      col1: [10, 14],
      col2: [14, 18],
      col3: [18, 22],
    },
    {
      page: 3,
      col1: [22, 25],
      col2: [25, 26],
      col3: [0, 0],
    },
  ];

  const handleProjectSelected = (projectId: number) => {
    const projectDetail = filteredProjects.find((p) => p.project_id === projectId) || null;

    if (projectDetail) {
      router.push(
        `${window.location.pathname}?projectId=${projectDetail.project_id}&cb=${Date.now()}`
      );
    }
  };

  return (
    <Layout>
      <TransitServiceModal
        opened={modalOpened}
        close={() => {
          setModalOpened(false);
          setActiveModal(null);
        }}
        service={selectedService}
        serviceItem={selectedServiceItem}
        serviceItemIcon={selectedServiceItemIcon}
        serviceItemDescription={selectedServiceItemDescription}
        serviceGroup={selectedServiceGroup}
        projects={selectedProjects}
        serviceLookup={selectedServiceLookup}
        handleProjectSelected={handleProjectSelected}
        agency={selectedAgency || ''}
      />
      <div className={styles.container}>
        <div className={styles.servicesContainer}>
          <TransitServiceCard
            title={transitServices[0]?.title}
            description={transitServices[0]?.description}
            projectCount={nyctProjectCount}
          />
          <div className={styles.dataCard}>
            <NyctServices col1={[0, 7]} col2={[7, 17]} col3={[17, 26]} />
            <div className={styles.dividerContainer}>
              <object
                style={{ width: '100%', height: '100%' }}
                data="/transit-services/divider.svg"
                type="image/svg+xml"
                width="100%"
                height="100%"
                aria-label="Divider"
              />
            </div>
            <BusService />
          </div>
        </div>
        <div className={styles.servicesContainer}>
          <TransitServiceCard
            title={transitServices[1]?.title}
            description={transitServices[1]?.description}
            projectCount={regionalRailProjectCount}
          />
          <RegionalRail />
        </div>
        <div className={styles.servicesContainer}>
          <TransitServiceCard
            title={transitServices[2]?.title}
            description={transitServices[2]?.description}
            projectCount={bridgesTunnelsProjectCount}
          />
          <BridgesTunnels />
        </div>
      </div>
      <div className={styles.mobileContainer}>
        <Accordion
          defaultValue="New York City Transit"
          className={styles.accordion}
          classNames={{
            item: styles.accordionItem,
            control: styles.accordionControl,
            label: styles.accordionLabel,
            panel: styles.accordionPanel,
            content: styles.accordionContent,
          }}
          variant="separated"
        >
          <Accordion.Item value="New York City Transit">
            <Accordion.Control>New York City Transit</Accordion.Control>
            <Accordion.Panel>
              <div className={styles.serviceAccordionItem}>
                <TransitServiceCard {...transitServices[0]} projectCount={nyctProjectCount} />
                <MobileServiceAccordion
                  items={[
                    {
                      title: 'Subway Services',
                      content: (
                        <PaginatedList
                          items={subwayItems.map((item) => ({
                            name: item.name,
                            icon: item.icon as JSX.Element,
                          }))}
                          itemsPerPage={4}
                          pages={subwayPageSlices.length}
                          content={(_, currentPage) => (
                            <NyctServices
                              col1={subwayPageSlices[currentPage].col1}
                              col2={subwayPageSlices[currentPage].col2}
                              col3={subwayPageSlices[currentPage].col3}
                            />
                          )}
                        />
                      ),
                    },
                    { title: 'Bus Services', content: <BusService /> },
                  ]}
                />
              </div>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="Regional Rail">
            <Accordion.Control>Regional Rail</Accordion.Control>
            <Accordion.Panel>
              <TransitServiceCard {...transitServices[1]} projectCount={regionalRailProjectCount} />
              <MobileServiceAccordion
                items={[
                  {
                    title: 'Long Island Rail Road',
                    content: (
                      <div className={styles.mobileDoubleColumn}>
                        {[lirrItems.slice(0, 6), lirrItems.slice(6)].map((col, index) => (
                          <TransitServiceColumn
                            key={index}
                            title="Long Island Rail Road"
                            items={col}
                            serviceGroup="Regional Rail"
                            agency="LIRR"
                            showTitle={false}
                          />
                        ))}
                      </div>
                    ),
                  },
                  {
                    title: 'Metro-North Railroad',
                    content: (
                      <TransitServiceColumn
                        title="Metro-North Railroad"
                        items={mnrItems}
                        serviceGroup="Regional Rail"
                        agency="MNR"
                      />
                    ),
                  },
                ]}
              />
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="Bridges and Tunnels">
            <Accordion.Control>Bridges and Tunnels</Accordion.Control>
            <Accordion.Panel>
              <TransitServiceCard
                {...transitServices[2]}
                projectCount={bridgesTunnelsProjectCount}
              />
              <MobileServiceAccordion
                items={[
                  {
                    title: 'Bridges',
                    content: (
                      <div className={styles.mobileDoubleColumn}>
                        {[bridgeItems.slice(0, 4), bridgeItems.slice(4)].map((col, index) => (
                          <TransitServiceColumn
                            key={index}
                            title="Bridges"
                            items={col}
                            serviceGroup="Bridges and Tunnels"
                            agency="BT"
                            showTitle={false}
                          />
                        ))}
                      </div>
                    ),
                  },
                  {
                    title: 'Tunnels',
                    content: (
                      <TransitServiceColumn
                        title="Tunnels"
                        items={tunnelItems}
                        serviceGroup="Bridges and Tunnels"
                        agency="BT"
                        showTitle={false}
                      />
                    ),
                  },
                ]}
              />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>
    </Layout>
  );
}

export default function WrappedTransitServicePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TransitServicePage />
    </Suspense>
  );
}
