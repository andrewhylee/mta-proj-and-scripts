import { FC, JSX } from 'react';
import { Card, Group, Text } from '@mantine/core';
import styles from './TransitServiceCard.module.css';

export interface TransitServiceCardProps {
  title: string;
  description: string;
  projectCount: number;
}

export const TransitServiceCard: FC<TransitServiceCardProps> = (props): JSX.Element => {
  const { title, description, projectCount } = props;

  return (
    <Card shadow="sm" className={styles.transitServiceCard} key={`${title}-${projectCount}`}>
      <div className={styles.header}>{title}</div>
      <Text className={styles.description}>{description}</Text>
      <Group className={styles.buttonGroup}>
        <div className={styles.projectCount}>
          Projects: <span className={styles.buttonValue}>{projectCount}</span>
        </div>
      </Group>
    </Card>
  );
};
