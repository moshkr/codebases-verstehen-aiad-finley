import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { DataPoint } from '@/types';

interface HistoricalChartProps {
  data: DataPoint[];
  title?: string;
}

/**
 * Downsamples data for better performance
 * Takes every nth point to reduce the number of points rendered
 */
function downsampleData(data: DataPoint[], maxPoints: number = 500): DataPoint[] {
  if (data.length <= maxPoints) return data;

  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, index) => index % step === 0);
}

/**
 * Historical Performance Chart
 * Displays portfolio value over time
 */
export const HistoricalChart: React.FC<HistoricalChartProps> = ({ data, title = 'Portfolio Performance' }) => {
  // Downsample data for performance
  const displayData = useMemo(() => downsampleData(data), [data]);

  // Format data for Recharts
  const chartData = useMemo(() => {
    return displayData.map(point => ({
      date: point.date,
      value: point.value,
      // Extract year for display
      year: new Date(point.date).getFullYear()
    }));
  }, [displayData]);

  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Select assets to view performance</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <h3 className="text-sm font-semibold text-gray-800 mb-2 px-4">{title}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="year"
            stroke="#666"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            scale="log"
            domain={['auto', 'auto']}
            stroke="#666"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value.toFixed(0)}€`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '12px'
            }}
            formatter={(value: number) => [`${value.toFixed(2)}€`, 'Value']}
            labelFormatter={(label) => `Year: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            name="Portfolio Value"
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
