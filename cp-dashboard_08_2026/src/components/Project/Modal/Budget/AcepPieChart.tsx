import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

export interface BudgetDataItem {
  acep: string;
  current_budget: number | string;
}

interface AcepPieChartProps {
  aceps: string[];
  budgetData: BudgetDataItem[];
  focusedAcep?: string;
}

const AcepPieChart: React.FC<AcepPieChartProps> = ({ aceps, budgetData, focusedAcep }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart width={200} height={200}>
      <Pie
        data={aceps.map((acep) => ({
          name: acep,
          value: budgetData
            .filter((item) => item.acep === acep)
            .reduce((sum, item) => sum + Number(item.current_budget), 0),
        }))}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={25}
        fill="#ffffff"
        stroke="#002164"
      >
        {aceps.map((_, index) => (
          <Cell key={`cell-${index}`} fill={focusedAcep === _ ? '#002164' : '#ffffff'} />
        ))}
      </Pie>
    </PieChart>
  </ResponsiveContainer>
);

export default AcepPieChart;
