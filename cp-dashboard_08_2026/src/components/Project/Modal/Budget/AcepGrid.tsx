import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './AcepGrid.module.css';

interface AcepBudgetData {
  acep: string;
  current_budget: number;
}

interface AcepGridProps {
  aceps: string[];
  isMobile: boolean;
  togglePieSlice: (
    event: React.MouseEvent<HTMLButtonElement>,
    active: boolean,
    acep: string
  ) => void;
  budgetData: AcepBudgetData[];
}

const AcepGrid: React.FC<AcepGridProps> = ({ aceps, isMobile, togglePieSlice, budgetData }) => {
  const router = useRouter();

  return (
    <>
      <div className={styles.acepGrid}>
        {aceps.map((acep, index) => (
          <div
            key={index}
            className={styles.acepColumn}
            style={{
              gridColumn: `${(index % (isMobile ? 2 : 4)) + 1} / span 1`,
              gridRow: `${Math.floor(index / (isMobile ? 2 : 4)) + 1} / span 1`,
            }}
          >
            <button
              type="button"
              className={styles.acepButton}
              onClick={() => {
                const currentPath = window.location.pathname;
                router.push(`${currentPath}?acepId=${encodeURIComponent(acep)}&cb=${Date.now()}`);
              }}
              onMouseOver={(event) => togglePieSlice(event, true, acep)}
              onMouseOut={(event) => togglePieSlice(event, false, acep)}
            >
              {acep}
            </button>
            <span className={styles.acepPercentage}>
              {(() => {
                const currentBudget =
                  budgetData.find((item) => item.acep === acep)?.current_budget || 0;

                const totalBudget = budgetData.reduce(
                  (acc, item) => acc + Number(item.current_budget || 0),
                  0
                );
                const percentage =
                  totalBudget > 0 ? Math.round((Number(currentBudget) / totalBudget) * 100) : 0;
                return percentage === 0 ? ' < 1' : percentage;
              })()}
              %
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default AcepGrid;
