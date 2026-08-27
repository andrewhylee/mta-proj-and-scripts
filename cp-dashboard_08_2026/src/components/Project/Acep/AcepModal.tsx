import React, { useState } from 'react';
import { Modal } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { AcepDataItem } from '@/data/Helpers/AcepData';
import AcepContent from './AcepContent';
import styles from './AcepModal.module.css';

export interface AcepModalProps {
  close: () => void;
  acep: string;
  stack?: any;
}

const AcepModal: React.FC<AcepModalProps> = (props) => {
  const { close, acep, stack } = props;
  const [acepData, setAcepData] = useState<AcepDataItem[]>([]);
  const isMobile = useMediaQuery('(max-width: 600px)');

  return (
    <Modal
      {...stack.register('acep')}
      onClose={close}
      classNames={{ header: styles.header, title: styles.title, close: styles.closeButton }}
      size="1000px"
      fullScreen={isMobile}
      title={
        <div className={styles.title}>
          <span className={styles.serviceGroup}>ACEP {acepData[0]?.acep}</span>
          <span>|</span>
          <span className={styles.serviceItem}>{acepData[0]?.title}</span>
        </div>
      }
    >
      <AcepContent
        acep={acep}
        isForModal
        handleAcepDataLoaded={(data) => setAcepData(data)}
        handleBackButtonClick={close}
      />
    </Modal>
  );
};

export default AcepModal;
