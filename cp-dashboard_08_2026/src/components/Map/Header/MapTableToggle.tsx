import { useState } from 'react';
import { IconInfoCircle, IconMap, IconTable } from '@tabler/icons-react';
import { HoverCard, Switch, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import styles from './MapTableToggle.module.css';

interface MapTableToggleProps {
  mapTableToggleChangedEvent?: (isTable: boolean) => void;
  showInfoIcon?: boolean;
  defaultSelectionToTable?: boolean;
  mapLabel?: string;
  tableLabel?: string;
}

const MapTableToggle: React.FC<MapTableToggleProps> = ({
  mapTableToggleChangedEvent,
  showInfoIcon = true,
  defaultSelectionToTable = false,
  mapLabel = 'Map',
  tableLabel = 'Table',
}) => {
  const [isTableSelected, setIsTableSelected] = useState(defaultSelectionToTable);

  const isMobile = useMediaQuery('(max-width: 850px)');

  const setToggleTextColor = (isTableSelected: boolean) => {
    const mapToggleTextElement = document.getElementById('mapToggleButton');
    const tableToggleTextElement = document.querySelector('tableToggleButton');
    if (mapToggleTextElement && tableToggleTextElement) {
      (mapToggleTextElement as HTMLElement).style.color = !isTableSelected
        ? 'var(--blue-color)'
        : 'var(--secondary-gray-color)';
      (tableToggleTextElement as HTMLElement).style.color = isTableSelected
        ? 'var(--blue-color)'
        : 'var(--secondary-gray-color)';
    }
  };

  const handleChangeEvent = ({ isTable }: { isTable: boolean }) => {
    setIsTableSelected(isTable);
    setToggleTextColor(isTable);
    if (mapTableToggleChangedEvent) {
      mapTableToggleChangedEvent(isTable);
    }
  };

  return (
    <div className={styles.mapToTableToggle}>
      {showInfoIcon && (
        <div className={styles.toggleParent}>
          <div className={styles.infoIcon}>
            <HoverCard width={290} shadow="md" position={isMobile ? 'bottom' : 'left'} withArrow>
              <HoverCard.Target>
                <IconInfoCircle />
              </HoverCard.Target>
              <HoverCard.Dropdown className={styles.hoverCard}>
                <Text className={styles.hoverText}>
                  Projects classified as Systemwide, Rolling Stock and Fund Administration will not
                  be reflected on the map.
                </Text>
              </HoverCard.Dropdown>
            </HoverCard>
          </div>
        </div>
      )}
      <button
        id="mapToggleButton"
        type="button"
        className={`${styles.toggleButton}  ${!isTableSelected ? styles.selectedText : styles.unselectedText}`}
        onClick={() => handleChangeEvent({ isTable: false })}
      >
        {mapLabel}
      </button>

      <Switch
        size="lg"
        color="var(--blue-color)"
        radius={4}
        checked={isTableSelected}
        onLabel={<IconMap size={16} stroke={2.5} color="white" />}
        offLabel={<IconTable size={16} stroke={2.5} color="white" />}
        classNames={{
          trackLabel: styles.trackLabel,
          track: styles.trackLabel,
          thumb: styles.trackThumb,
        }}
        onChange={(checked) => {
          const isTable = checked.target.checked;
          handleChangeEvent({ isTable });
        }}
      />

      <button
        id="tableToggleButton"
        type="button"
        className={`${styles.toggleButton} ${isTableSelected ? styles.selectedText : styles.unselectedText}`}
        onClick={() => handleChangeEvent({ isTable: true })}
      >
        {tableLabel}
      </button>
    </div>
  );
};

export default MapTableToggle;
