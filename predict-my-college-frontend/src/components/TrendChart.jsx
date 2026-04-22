import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

const TrendChart = ({ data }) => {
  // data format: { "2023": 95, "2024": 96, "2025": 97 }
  const chartData = Object.entries(data)
    .filter(([year, val]) => val !== null && val !== 'NA' && val !== '-')
    .map(([year, val]) => ({
      year,
      percentile: parseFloat(val),
    }))
    .sort((a, b) => a.year - b.year);

  if (chartData.length < 2) {
    return (
      <div className="flex items-center justify-center h-32 p-4 text-slate-500 text-sm italic bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
        Insufficient historical data for trend analysis.
      </div>
    );
  }

  return (
    <div className="h-[220px] w-full mt-4 bg-white dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-inner">
       <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPercentile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.1} />
            <XAxis 
              dataKey="year" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                borderRadius: '12px', 
                border: '1px solid #334155',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                padding: '8px 12px'
              }}
              labelStyle={{ fontWeight: 'bold', color: '#22d3ee', marginBottom: '4px' }}
              itemStyle={{ color: '#f8fafc', fontSize: '11px', padding: 0 }}
              cursor={{ stroke: '#22d3ee', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area 
              type="monotone" 
              dataKey="percentile" 
              stroke="#22d3ee" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPercentile)" 
              dot={{ r: 4, fill: '#22d3ee', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
            />
          </AreaChart>
       </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
