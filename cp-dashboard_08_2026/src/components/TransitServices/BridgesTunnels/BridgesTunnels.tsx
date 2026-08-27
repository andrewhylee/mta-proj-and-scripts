import React, { JSX, useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { transitServicesAtom, TransitServiceType } from '@/data/Helpers/TransitServiceData';
import TransitServiceColumn from '../TransitServiceColumn';
import styles from './BridgesTunnels.module.css';

export interface BridgeTunnelItem {
  name: string;
  icon: JSX.Element;
  description: string;
  serviceLookup?: string;
}

export const bridgeServicesAtom = atom<TransitServiceType[]>([]);
export const tunnelServicesAtom = atom<TransitServiceType[]>([]);

const BridgeTunnelIcon: React.FC<{ icon: string; altText: string }> = ({ icon, altText }) => (
  <img src={icon} alt={altText} className={styles.icon} />
);

export const convertServicesToItems = (
  services: { name: string; description: string; id: string }[]
): BridgeTunnelItem[] => {
  return services.map((service, _index) => ({
    name: service.name,
    icon: generateBridgeTunnelIcon(service.name),
    description: service.description || `Default description for ${service.name}`,
    serviceLookup: service.id,
  }));
};

export const generateBridgeTunnelIcon = (name: string): JSX.Element => {
  const icon = name.includes('Bridge')
    ? '/transit-services/bridge.svg'
    : '/transit-services/tunnel.svg';
  return <BridgeTunnelIcon key={name} icon={icon} altText={name} />;
};

const BridgesTunnels: React.FC = () => {
  const serviceGroup = 'Bridges and Tunnels';

  const [services] = useAtom(transitServicesAtom);
  const [bridgeServices, setBridgeServices] = useAtom(bridgeServicesAtom);
  const [tunnelServices, setTunnelServices] = useAtom(tunnelServicesAtom);

  const bridgeItems = React.useMemo(() => convertServicesToItems(bridgeServices), [bridgeServices]);
  const tunnelItems = React.useMemo(() => convertServicesToItems(tunnelServices), [tunnelServices]);

  useEffect(() => {
    const filteredBridgeServices = services.filter((service) => service.name.includes('Bridge'));

    setBridgeServices(filteredBridgeServices);

    const filteredTunnelServices = services.filter((service) => service.name.includes('Tunnel'));
    setTunnelServices(filteredTunnelServices);
  }, [services]);

  return (
    <div className={styles.dataCard}>
      <TransitServiceColumn
        key={`bridges-${bridgeItems.length}-${Date.now()}`} // Force re-render for debugging
        title="Bridges"
        items={bridgeItems}
        serviceGroup={serviceGroup}
        agency="BT"
      />
      <div className={styles.dividerContainer}>
        <object
          data="/transit-services/divider.svg"
          type="image/svg+xml"
          width="100%"
          height="100%"
          aria-label="Divider"
        />
      </div>
      <TransitServiceColumn
        title="Tunnels"
        items={tunnelItems}
        serviceGroup={serviceGroup}
        agency="BT"
      />
    </div>
  );
};

export default BridgesTunnels;
