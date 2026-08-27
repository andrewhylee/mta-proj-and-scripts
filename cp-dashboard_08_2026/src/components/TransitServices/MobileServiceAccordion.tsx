import React from 'react';
import { Accordion } from '@mantine/core';
import styles from './MobileServiceAccordion.module.css';

export interface ServiceSubAccordionItem {
  title: string;
  content: React.ReactNode;
}

interface ServiceSubAccordionProps {
  items: ServiceSubAccordionItem[];
}

const MobileServiceAccordion: React.FC<ServiceSubAccordionProps> = ({ items }) => (
  <Accordion
    defaultValue={items[0].title}
    classNames={{
      control: styles.subAccordionControl,
      panel: styles.subAccordionPanel,
      label: styles.subAccordionLabel,
    }}
  >
    {items.map((item) => (
      <Accordion.Item value={item.title} key={item.title}>
        <Accordion.Control>{item.title}</Accordion.Control>
        <Accordion.Panel>{item.content}</Accordion.Panel>
      </Accordion.Item>
    ))}
  </Accordion>
);

export default MobileServiceAccordion;
