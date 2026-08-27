import React, { useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { transitServicesAtom } from '@/data/Helpers/TransitServiceData';
import TransitServiceColumn, { TransitServiceItem } from '../TransitServiceColumn';
import styles from './RegionalRail.module.css';

export const RailLineItemBox: React.FC<{ color: string }> = ({ color }) => (
  <div className={styles.railLineItemBox} style={{ backgroundColor: color }} />
);

export const lirrItemsAtom = atom<TransitServiceItem[]>([]);
export const mnrItemsAtom = atom<TransitServiceItem[]>([]);
const RegionalRail: React.FC = () => {
  const serviceGroup = 'Regional Rail';

  const [transitServices] = useAtom(transitServicesAtom);
  const [lirrItems, setLirrItems] = useAtom(lirrItemsAtom);
  const [mnrItems, setMnrItems] = useAtom(mnrItemsAtom);

  useEffect(() => {
    setLirrItems(
      transitServices
        .filter((service) => service.agency === 'LIRR')
        .map((service) => ({
          name: service.name,
          icon: <RailLineItemBox color={service.color} />,
          description: service.description || `Default description for ${service.name}`,
          serviceLookup: service.id,
        }))
    );

    setMnrItems(
      transitServices
        .filter((service) => service.agency === 'MNR')
        .map((service) => ({
          name: service.name,
          icon: <RailLineItemBox color={service.color} />,
          description: service.description || `Default description for ${service.name}`,
          serviceLookup: service.id,
        }))
    );
  }, [transitServices]);

  return (
    <div className={styles.railDataCard}>
      <TransitServiceColumn
        title="Long Island Rail Road"
        items={lirrItems}
        serviceGroup={serviceGroup}
        agency="LIRR"
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
        title="Metro-North Railroad"
        items={mnrItems}
        serviceGroup={serviceGroup}
        agency="MNR"
      />
    </div>
  );
};

export default RegionalRail;
