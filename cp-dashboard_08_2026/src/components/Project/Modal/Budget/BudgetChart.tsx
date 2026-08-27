import React, { useEffect } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface BudgetChartData {
  task: string;
  baseline_budget: number;
  current_budget: number;
  eac: number;
  expenditures: number;
  update_date: Date;
}

interface BudgetChartDataRollup {
  baseline_budget: number;
  current_budget: number;
  eac: number;
  expenditures: number;
  update_date: Date;
}

interface BudgetChartProps {
  items: BudgetChartData[];
}

const BudgetChart: React.FC<BudgetChartProps> = ({ items }) => {
  const [chartItems, setChartItems] = React.useState<BudgetChartDataRollup[]>([]);

  useEffect(() => {
    const defaultItems = JSON.parse(JSON.stringify(items)) as BudgetChartDataRollup[];

    defaultItems.sort(
      (a, b) => new Date(a.update_date).getTime() - new Date(b.update_date).getTime()
    );

    setChartItems(defaultItems);
  }, [items]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={chartItems} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="update_date"
          tickFormatter={(date) => {
            const d = new Date(date);
            const mm = d.toLocaleString('default', { month: 'short' });
            const yy = String(d.getFullYear()).slice(-2);
            return `${mm} '${yy}`;
          }}
          interval="preserveStartEnd"
          minTickGap={10}
        />
        <YAxis
          label={{
            value: 'Budget (Millions of $)',
            angle: -90,
            position: 'insideLeft',
            style: { textAnchor: 'middle', fontWeight: 700 },
          }}
          domain={['auto', 'auto']}
          tickFormatter={(v) => (v / 1_000_000).toLocaleString()}
        />
        <Tooltip
          formatter={(value: number) =>
            `$${(value as number).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
          }
          labelFormatter={(label) => {
            const d = new Date(label);
            const mm = d.toLocaleString('default', { month: 'short' });
            const yy = String(d.getFullYear()).slice(-2);
            return `Date: ${mm} '${yy}`;
          }}
          contentStyle={{ fontSize: 10, padding: '6px 10px', lineHeight: 0.8 }}
          wrapperStyle={{ minWidth: 0, maxWidth: 220 }}
        />
        <Legend
          verticalAlign="bottom"
          align="left"
          iconType="plainline"
          wrapperStyle={{ paddingTop: 20 }}
        />
        {/* Expenditures (area, green) */}
        <Area
          type="monotone"
          dataKey="expenditures"
          stroke="#17814b"
          fill="#17814b"
          fillOpacity={0.15}
          strokeWidth={4}
          name="Expenditures"
          activeDot={{ r: 4 }}
        />
        {/* Baseline Budget (dashed line) */}
        <Line
          type="monotone"
          dataKey="baseline_budget"
          stroke="#222"
          strokeDasharray="8 6"
          strokeWidth={4}
          dot={false}
          name="Baseline Budget"
        />
        {/* Current Budget (solid blue line) */}
        <Line
          type="monotone"
          dataKey="current_budget"
          stroke="#026cb6"
          strokeWidth={4}
          dot={false}
          name="Current Budget"
        />
        {/* Estimate at Completion (solid yellow line) */}
        {/* <Line
          type="monotone"
          dataKey="eac"
          stroke="#f7b500"
          strokeWidth={3}
          dot={false}
          name="Estimate at Completion"
        /> */}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default BudgetChart;
