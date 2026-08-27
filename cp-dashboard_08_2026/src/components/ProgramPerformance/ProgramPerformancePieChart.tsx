import { useEffect } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useMediaQuery } from '@mantine/hooks';
import { ProgramPerformanceData } from '@/app/program-performance/page';
import CustomTooltip from './CustomToolTip';

type TooltipPayload = ReadonlyArray<any>;

type Coordinate = {
  x: number;
  y: number;
};

type PieSectorData = {
  count?: number;
  name?: string | number;
  midAngle?: number;
  middleRadius?: number;
  tooltipPosition?: Coordinate;
  value?: number;
  paddingAngle?: number;
  dataKey?: string;
  payload?: any;
  tooltipPayload?: ReadonlyArray<TooltipPayload>;
};

type GeometrySector = {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
};

type PieLabelProps = PieSectorData &
  GeometrySector & {
    tooltipPayload?: any;
  };

interface ProgramPerformancePieChartProps {
  milestones: ProgramPerformanceData[];
  isBehindScheduleToggled?: boolean;
  isOverBudgetToggled?: boolean;
  isBudgetOnly?: boolean;
  isScheduleOnly?: boolean;
}

const ProgramPerformancePieChart = ({
  milestones,
  isBehindScheduleToggled,
  isOverBudgetToggled,
  isBudgetOnly,
  isScheduleOnly,
}: ProgramPerformancePieChartProps) => {
  const isMobile = useMediaQuery('(max-width: 1024px)');

  const getColorFromName = (name: string) => {
    const uCaseName = name.toUpperCase();

    if (uCaseName.includes('ON') && (uCaseName.includes('BEHIND') || uCaseName.includes('OVER'))) {
      return 'var(--secondary-orange)';
    }
    if (uCaseName.includes('ON')) {
      return 'var(--secondary-green)';
    }
    if (uCaseName.includes('BEHIND') || uCaseName.includes('OVER')) {
      return 'var(--secondary-red)';
    }
    return 'var(--secondary-gray)';
  };

  const setPieCellOpacity = () => {
    const allCells = [
      'cell-Behind-Schedule-Over-Budget',
      'cell-Behind-Schedule-On-Budget',
      'cell-On-Schedule-Over-Budget',
      'cell-On-Schedule-On-Budget',
      'cell-On-Schedule',
      'cell-Behind-Schedule',
      'cell-On-Budget',
      'cell-Over-Budget',
    ];
    let cell: HTMLElement | null = null;
    if (isBehindScheduleToggled && isOverBudgetToggled) {
      cell = document.getElementById('cell-Behind-Schedule-Over-Budget');
    } else if (isBehindScheduleToggled && !isOverBudgetToggled) {
      cell = document.getElementById('cell-Behind-Schedule-On-Budget');
    } else if (!isBehindScheduleToggled && isOverBudgetToggled) {
      cell = document.getElementById('cell-On-Schedule-Over-Budget');
    } else if (!isBehindScheduleToggled && !isOverBudgetToggled) {
      cell = document.getElementById('cell-On-Schedule-On-Budget');
    }
    if (isBudgetOnly) {
      if (isOverBudgetToggled) {
        cell = document.getElementById('cell-Over-Budget');
      } else {
        cell = document.getElementById('cell-On-Budget');
      }
    }
    if (isScheduleOnly) {
      if (isBehindScheduleToggled) {
        cell = document.getElementById('cell-Behind-Schedule');
      } else {
        cell = document.getElementById('cell-On-Schedule');
      }
    }

    allCells.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.style.opacity = '0.5'; // Set opacity to 0.5 for all cells
      }
    });

    if (cell) {
      cell.style.opacity = '1.0';
    }
  };

  const RADIAN = Math.PI / 180;

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
    name,
  }: PieLabelProps) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
    const y = cy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {/* Calculate percentage and dynamic font size */}
        {(() => {
          const total = milestones.reduce((sum, m) => sum + (m.value ?? 0), 0);
          // const value = typeof count === 'number' ? count : 0;
          const percent = total > 0 ? value! / total : 0;
          // Base font size between 1.2rem and 2.2rem, proportional to percent (min 1.2, max 2.2)
          // Dynamically calculate font size so it fits inside the pie
          // Clamp font size between min and max based on available radius and percent
          const minFontSize = isMobile ? 0.525 : 1; // Base font size in rem
          const maxFontSize = Math.max(((outerRadius - innerRadius) * 0.25) / 10, minFontSize); // scale with radius
          const percentFont = percent * maxFontSize;
          const fontSize = `${Math.max(minFontSize, Math.min(percentFont, maxFontSize))}rem`;
          return (
            <>
              <tspan x={x} dy="-2.25rem" style={{ fontSize }}>
                {value}
              </tspan>
              {typeof name === 'string' && name.split(' ').length > 2 ? (
                <>
                  <tspan x={x} dy="1.2em" style={{ fontSize }}>
                    {name.split(' ').slice(0, 2).join(' ')}
                  </tspan>
                  <tspan x={x} dy="1em" style={{ fontSize }}>
                    {name.split(' ').slice(2).join(' ')}
                  </tspan>
                </>
              ) : (
                <tspan x={x} dy="1em" style={{ fontSize }}>
                  {name ?? ''}
                </tspan>
              )}
            </>
          );
        })()}
      </text>
    );
  };

  useEffect(() => {
    setPieCellOpacity();
  }, [isBehindScheduleToggled, isOverBudgetToggled]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart
        key={JSON.stringify(milestones)}
        style={{ width: '100%', height: '100%', maxWidth: '100%' }}
      >
        <Tooltip content={(props) => <CustomTooltip {...props} />} />
        <Pie
          data={milestones}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          // label={({ name }) => name}
          onAnimationEnd={() => setPieCellOpacity()}
          // outerRadius={isMobile ? 150 : 300} // Shrink on mobile
          fill="var(--secondary-gray)"
          dataKey="value"
          stroke="#fff"
          strokeWidth={6}
        >
          {milestones.map((entry) => (
            <Cell
              id={`cell-${entry.name.replaceAll(' ', '-')}`}
              key={`cell-${entry.name}`}
              fill={getColorFromName(entry.name)}
              style={{ opacity: 0.5 }}
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ProgramPerformancePieChart;
