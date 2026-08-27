import { Image } from '@mantine/core';
import styles from './MTALogo.module.css';

export function MTALogo({
  hiddenFrom,
  visibleFrom,
}: {
  hiddenFrom?: string;
  visibleFrom?: string;
}) {
  return (
    <Image
      id="mtaLogo"
      src="/mtalogo.svg"
      alt="MTA Logo"
      className={styles.mtaLogo}
      hiddenFrom={hiddenFrom}
      visibleFrom={visibleFrom}
    />
  );
}
