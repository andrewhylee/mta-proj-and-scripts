import { useState } from 'react';
import { Button } from '@mantine/core';
import styles from './MapLocalityTab.module.css';

interface MapLocalityTabProps {
  localityChangedEvent?: (locality: string) => void;
  shouldShow: boolean;
}

const MapLocalityTab: React.FC<MapLocalityTabProps> = ({ localityChangedEvent, shouldShow }) => {
  const [isNYC, setIsNYC] = useState(true);

  function handleLocalityChange(event: React.MouseEvent<HTMLButtonElement>, locality: string) {
    event.currentTarget.style.backgroundColor = 'var(--dark-blue-color)';

    setIsNYC(locality === 'NYC');

    if (localityChangedEvent) {
      localityChangedEvent(locality);
    }
  }

  return (
    <div className={styles.mapLocalityTabs} style={{ display: shouldShow ? 'flex' : 'none' }}>
      <Button
        id="btnNYC"
        onClick={(event) => handleLocalityChange(event, 'NYC')}
        style={{
          backgroundColor: !isNYC ? 'var(--blue-color)' : 'var(--dark-blue-color)',
        }}
      >
        New York City
      </Button>
      <Button
        id="btnRegion"
        onClick={(event) => handleLocalityChange(event, 'Region')}
        style={{
          backgroundColor: isNYC ? 'var(--blue-color)' : 'var(--dark-blue-color)',
        }}
      >
        New York Region
      </Button>
    </div>
  );
};

export default MapLocalityTab;
