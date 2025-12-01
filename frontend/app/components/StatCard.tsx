'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  deltaLabel?: string;
  chartData?: Array<{ date: string; value: number }>;
  chartKey?: string;
  borderColor?: string;
  icon?: React.ReactNode;
}

export default function StatCard({
  title,
  value,
  suffix = '',
  deltaLabel,
  chartData = [],
  chartKey = 'value',
  borderColor = 'border-blue-500',
  icon,
}: StatCardProps) {
  // Determine line color based on border color
  const getLineColor = () => {
    if (borderColor.includes('blue')) return '#60a5fa';
    if (borderColor.includes('green')) return '#34d399';
    if (borderColor.includes('yellow')) return '#fbbf24';
    if (borderColor.includes('purple')) return '#a78bfa';
    return '#7a91f8';
  };

  // Transform chart data if needed
  const displayData = chartData.length > 0
    ? chartData.map(item => {
        const dateStr = typeof item === 'object' && 'date' in item ? item.date : '';
        // Date is already formatted from parent component (e.g., "26/11")
        const dateDisplay = dateStr || '';
        const value = typeof item === 'object' && 'value' in item ? item.value : 0;
        return { date: dateDisplay, value };
      })
    : [];

  return (
    <div className={`glass-card rounded-2xl p-6 border-l-4 ${borderColor} overflow-hidden`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-midnight-400 text-sm font-medium">{title}</h3>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <div className="text-4xl font-bold text-midnight-100 mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </div>
      {deltaLabel && (
        <p className="text-xs text-midnight-500 mb-3">{deltaLabel}</p>
      )}
      {displayData.length > 0 && (
        <div className="h-16 -mx-6 -mb-6 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ left: 0, right: 0, top: 5, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${borderColor}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getLineColor()} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={getLineColor()} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                hide
              />
              <YAxis hide domain={[0, 'dataMax + 2']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 15, 35, 0.98)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#f0f4ff',
                  fontSize: '12px',
                  padding: '8px 12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                }}
                labelStyle={{ color: '#cbd5e1', fontSize: '11px', marginBottom: '4px' }}
                formatter={(value: number) => [value, 'Số lượng']}
                cursor={{ stroke: getLineColor(), strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={getLineColor()}
                strokeWidth={2}
                fill={`url(#gradient-${borderColor})`}
                fillOpacity={1}
                dot={false}
                activeDot={{ r: 4, fill: getLineColor(), strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

