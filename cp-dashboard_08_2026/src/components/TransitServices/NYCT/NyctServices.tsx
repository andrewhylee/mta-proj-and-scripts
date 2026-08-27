import React from 'react';
import { atom, useAtom } from 'jotai';
import { transitServicesAtom } from '@/data/Helpers/TransitServiceData';
import TransitServiceColumn, { TransitServiceItem } from '../TransitServiceColumn';
import styles from './NyctServices.module.css';

export const SubwayLineIcon = ({
  line,
  name,
  backgroundColor,
  textColor,
}: {
  line: string;
  name: string;
  backgroundColor: string;
  textColor: string;
}) => {
  const renderLineText = () => {
    if (line.length === 2) {
      return (
        <>
          {line.substring(0, 1)}
          <span className={styles.smallText}>{line.substring(1)}</span>
        </>
      );
    }
    return <span className={styles.normalLine}>{line}</span>;
  };

  return (
    <div className={styles.subwayLineIcon}>
      <div
        className={styles.subwayLine}
        style={{ backgroundColor }}
        aria-label={`Subway line ${line}`}
        title={name}
      >
        <div style={{ color: textColor }}>{renderLineText()}</div>
      </div>
    </div>
  );
};

const renderTrainName = (name: string) => {
  if (name.includes('SF')) {
    return (
      <>
        S<span className={styles.subscriptText}>F</span> train
      </>
    );
  }
  if (name.includes('SR')) {
    return (
      <>
        S<span className={styles.subscriptText}>R</span> train
      </>
    );
  }
  return name;
};

export const subwayItemsAtom = atom<TransitServiceItem[]>([]);

interface NyctServicesProps {
  col1: [number, number];
  col2: [number, number];
  col3: [number, number];
}

const NyctServices: React.FC<NyctServicesProps> = ({ col1, col2, col3 }) => {
  const [subwayItems, setSubwayItems] = useAtom(subwayItemsAtom);
  const [transitServices] = useAtom(transitServicesAtom);

  React.useEffect(() => {
    setSubwayItems(
      transitServices
        .filter(
          (service) => service.agency === 'NYCT' && !service.name.toLowerCase().includes('bus')
        )
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((service) => ({
          name: renderTrainName(service.name),
          icon: (
            <SubwayLineIcon
              line={service.designation!}
              backgroundColor={service.color!}
              textColor={service.textColor!}
              name={service.name}
            />
          ),
          serviceLookup: service.id,
          description: service.description || `Default description for ${service.name}`,
        }))
    );
  }, [transitServices]);

  return (
    <div className={styles.subwayServicesContainer}>
      <div>
        <span className={styles.title}>Subway Service</span>
      </div>
      <div className={styles.subwayService} aria-label="Subway Services Directory">
        {[subwayItems.slice(...col1), subwayItems.slice(...col2), subwayItems.slice(...col3)].map(
          (col, index) => (
            <TransitServiceColumn
              key={index}
              title="Subway Service"
              items={col}
              serviceGroup="NYC Transit"
              showTitle={false}
              agency="NYCT"
            />
          )
        )}
      </div>
    </div>
  );
};

export default NyctServices;
