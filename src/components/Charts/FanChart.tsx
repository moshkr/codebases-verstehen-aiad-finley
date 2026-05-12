import React, { useMemo } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart
} from 'recharts';
import { SimulationResult } from '@/types';

interface FanChartProps {
  simulationResult: SimulationResult;
  title?: string;
}

/**
 * Fan Chart for Monte Carlo Simulation Results
 * Shows 10th, 50th, and 90th percentile paths
 */
export const FanChart: React.FC<FanChartProps> = ({
  simulationResult,
  title = 'Future Forecast (Monte Carlo Simulation)'
}) => {
  const chartData = useMemo(() => {
    const { percentile10, percentile50, percentile90 } = simulationResult;

    return percentile50.map((point, index) => ({
      date: point.date,
      p10: percentile10[index]?.value || 0,
      p50: point.value,
      p90: percentile90[index]?.value || 0,
      // Extract year and month for display
      yearMonth: new Date(point.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    }));
  }, [simulationResult]);

  // Downsample if too many points
  const displayData = useMemo(() => {
    if (chartData.length <= 120) return chartData; // Max 10 years * 12 months
    const step = Math.ceil(chartData.length / 120);
    return chartData.filter((_, index) => index % step === 0);
  }, [chartData]);

  return (
    <div className="w-full h-full">
      <h3 className="text-sm font-semibold text-gray-800 mb-2 px-4">{title}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart data={displayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorRange" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f87171" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="yearMonth"
            stroke="#666"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#666"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '12px'
            }}
            formatter={(value: number) => `$${value.toFixed(2)}`}
          />
          <Legend />

          {/* Shaded area between 10th and 90th percentile */}
          <Area
            type="monotone"
            dataKey="p90"
            stroke="none"
            fill="#82ca9d"
            fillOpacity={0.2}
            name="90th Percentile (Best Case)"
          />
          <Area
            type="monotone"
            dataKey="p10"
            stroke="none"
            fill="#f87171"
            fillOpacity={0.2}
            name="10th Percentile (Worst Case)"
          />

          {/* Percentile lines */}
          <Line
            type="monotone"
            dataKey="p10"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            name="10th Percentile"
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="p50"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
            name="Median (50th)"
          />
          <Line
            type="monotone"
            dataKey="p90"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            name="90th Percentile"
            strokeDasharray="5 5"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
