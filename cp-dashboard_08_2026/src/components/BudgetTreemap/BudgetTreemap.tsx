'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import type { Config, PlotData, PlotMouseEvent } from 'plotly.js';
import { budgetLevelTitles, codeLengthToNestedLevel } from '@/constants/budget-constants';
import budgetOverviewData from '@/data/budget-overview.json';
import { BudgetFilters, BudgetOverviewItem } from '@/types/budget-types';
import BudgetTreemapFilterGrid from './Filters/BudgetTreemapFilterGrid';
import styles from './BudgetTreemap.module.css';

/** Section 1: object / data / type definitions */
const typedBudgetOverviewData = budgetOverviewData as BudgetOverviewItem[];
const acepIdDelimiter = '-';
const Plot = dynamic(() => import('react-plotly.js'), {
  loading: () => <h3>Loading Treemap Visualization...</h3>,
  ssr: false,
});

const config = {
  displayModeBar: true,
  displaylogo: false,
  modeBarButtonsToRemove: ['pan2d', 'select2d', 'lasso2d', 'autoScale2d', 'toImage'],
  toImageButtonOptions: {
    format: 'png',
    filename: 'capital_plan_treemap',
    height: 1000,
    width: 900,
    scale: 1,
  },
} as Partial<Config>;

interface BudgetTreemapProps {
  show?: boolean;
  height?: number;
  width: number;
}

/** Section 2: function definitions for getting data ready for Plotly */
function generateHovertext(
  obj: BudgetOverviewItem,
  parentLabel: string,
  budgetFromChildren: number
) {
  return `<b>${obj.description}</b><br>
  Code: ${obj.code}<br>
  Budget: $${Math.floor(budgetFromChildren * 1000).toLocaleString('en-US')}<br>
  ${obj.code.length !== 1 ? `${budgetLevelTitles[codeLengthToNestedLevel[obj.code.length] - 1]}: ${parentLabel}<br>` : ''}
  ${(obj.children?.length || 0) === 0 ? 'Click to see budget history' : 'Click to drill down'}`;
}

function extractArraysFromJSON(
  list: BudgetOverviewItem[],
  parent: string,
  parentLabel: string,
  result: Partial<PlotData>,
  filters: BudgetFilters
) {
  let totalBudgetFromChildren = 0;
  for (const obj of list) {
    // Filtering section
    // if data exists in the filter set, it shows on the Treemap
    if (filters.plan.size > 0 && obj.code.length === 1 && !filters.plan.has(obj.description)) {
      continue;
    }
    if (filters.agency.size > 0 && obj.code.length === 2 && !filters.agency.has(obj.description)) {
      continue;
    }
    if (
      filters.type.size > 0 &&
      obj.code.length === 6 &&
      !filters.type.has(obj.harmonized_category || '')
    ) {
      continue;
    }
    if (
      filters.needsCode.size > 0 &&
      obj.code.length === 8 &&
      !filters.needsCode.has(obj.needs_code)
    ) {
      continue;
    }

    // Recursive JSON data extraction
    const uniqueId = `${obj.code}${acepIdDelimiter}${obj.description}`;
    let budgetFromChildren;
    if (obj.children) {
      budgetFromChildren =
        extractArraysFromJSON(
          obj.children, // list to be recursed
          uniqueId, // parent
          obj.description, // parentLabel
          result,
          filters
        ) || 0;
      totalBudgetFromChildren += budgetFromChildren;
    } else {
      budgetFromChildren = obj.total_allocation;
      totalBudgetFromChildren += budgetFromChildren;
    }

    (result.ids as string[]).push(uniqueId);
    (result.labels as string[]).push(obj.description);
    (result.parents as string[]).push(parent);
    (result.values as number[]).push(budgetFromChildren);
    (result.hovertext as string[]).push(generateHovertext(obj, parentLabel, budgetFromChildren));
  }
  return totalBudgetFromChildren;
}

function getPlotDetails(
  capitalPlans: BudgetOverviewItem[],
  filters: BudgetFilters
): Partial<PlotData>[] {
  // Create Plotly specific Trace objects to pass into Plotly
  const manyPlotsDetails = [];
  for (const capitalPlan of capitalPlans) {
    const treemapTrace = {
      labels: [] as string[],
      parents: [] as string[],
      values: [] as number[],
      ids: [] as string[],
      hovertext: [] as string[],
      type: 'treemap',
      textinfo: 'text',
      hovertemplate: '%{hovertext}<extra></extra>',
      branchvalues: 'total',
      maxdepth: 3,
      outsidetextfont: { size: 40 },
      pathbar: {
        thickness: 20,
        textfont: { size: 12.5, color: 'white' },
      },
    } as Partial<PlotData>;
    extractArraysFromJSON([capitalPlan], '', '', treemapTrace, filters);
    treemapTrace.text = treemapTrace.labels as string | undefined;
    manyPlotsDetails.push(treemapTrace);
  }
  return manyPlotsDetails;
}

export default function BudgetTreemap({ show = true, height = 400, width }: BudgetTreemapProps) {
  /** Section 4: useState's & useMemo */
  const [filters, setFilters] = useState<BudgetFilters>({
    plan: new Set<string>(),
    agency: new Set<string>(),
    type: new Set<string>(), // filters on harmonized_category
    needsCode: new Set<string>(),
  });
  const [num, setNum] = useState<number>(0);
  const manyPlotsDetails = useMemo(
    () => getPlotDetails(typedBudgetOverviewData, filters),
    [filters]
  );
  const router = useRouter();

  const openModal = ({ points }: PlotMouseEvent) => {
    //@ts-ignore
    const acepId = points[0].id.split(acepIdDelimiter)[0];
    if (acepId && acepId.length === 8) {
      router.push(`${window.location.pathname}?acepId=${acepId}&cb=${Date.now()}`);
      throw Error('Prevent Leaf Node Expansion within Treemap');
    }
  };

  if (!manyPlotsDetails) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No data available for visualization</p>
      </div>
    );
  }

  return (
    <div className={clsx(styles.budgetTreemapContainer, show ? 'showFlex' : 'noShow')}>
      <div className={styles.filterSection}>
        <BudgetTreemapFilterGrid setFilters={setFilters} filters={filters} setNum={setNum} />
      </div>
      <div className={styles.treemaps}>
        {manyPlotsDetails.map((aPlotsDetails, i) => (
          <div
            key={i}
            className={clsx(
              !(aPlotsDetails.values as any).length ||
                (aPlotsDetails.values as any)[(aPlotsDetails.values as any).length - 1] === 0
                ? 'noShow'
                : 'showFlex',
              styles.treemap
            )}
          >
            <Plot
              onClick={openModal}
              data={[aPlotsDetails]}
              layout={{
                font: { size: 20, family: "'Neue Haas Grotesk Text Pro', sans-serif" },
                margin: { t: 24, l: 10, r: 10, b: 10 },
                paper_bgcolor: 'white',
                plot_bgcolor: 'white',
                datarevision: num,
              }}
              config={config}
              style={{
                width,
                height: `${height}px`,
              }}
              useResizeHandler
            />
          </div>
        ))}
      </div>
    </div>
  );
}
