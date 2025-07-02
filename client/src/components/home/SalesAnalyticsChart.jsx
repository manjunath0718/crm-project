import React from 'react';
// import { Paper, Typography } from '@mui/material'; // Removed MUI imports
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './SalesAnalyticsChart.module.css'; // Import the CSS module

// Custom Tooltip component
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length && payload[0].value > 0) {
    return (
      <div className={styles.customTooltip}>
        <span className={styles.tooltipLabel}>{label}</span>
        <span className={styles.tooltipValue}>{payload[0].value} leads completed</span>
      </div>
    );
  }
  return null;
}

function SalesAnalyticsChart({ data }) {
  // Transform API data to chart format
  const chartData = (data && data.length > 0)
    ? data.map(item => ({
        day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
        rate: item.count
      }))
    : [
      { day: 'Sat', rate: 10 }, { day: 'Sun', rate: 15 }, { day: 'Mon', rate: 8 }, { day: 'Tue', rate: 5 },
      { day: 'Wed', rate: 20 }, { day: 'Thu', rate: 30 }, { day: 'Fri', rate: 25 },
      { day: 'Sun', rate: 12 }, { day: 'Mon', rate: 18 }, { day: 'Tue', rate: 10 }, { day: 'Wed', rate: 15 }, { day: 'Thu', rate: 20 }, { day: 'Fri', rate: 22 },
    ];
  // Custom y-axis ticks for leads
  const yTicks = [5, 10, 15, 20, 30, 50];
  return (
    <div className={styles.chartCard}> {/* Replaced Paper with div */}
      <h6 className={styles.chartTitle}>Sale Analytics</h6> {/* Replaced Typography with h6 */}
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
          barCategoryGap={"20%"}
        >
          <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#e0e0e0" /> {/* Subtle horizontal lines only */}
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: '0.9rem', fill: '#bdbdbd' }} /> {/* No axis line, no tick line */}
          <YAxis
            axisLine={false}
            tickLine={false}
            domain={[0, 50]}
            ticks={yTicks}
            tickFormatter={(value) => value}
            tick={{ fontSize: '0.95rem', fill: '#bdbdbd' }}
            label={{ value: 'Leads Completed', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '0.95rem', fill: '#bdbdbd' } }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(66,133,244,0.08)' }} />
          <Bar dataKey="rate" fill="#e0e0e0" radius={[8, 8, 8, 8]} barSize={18} /> {/* Google Blue, rounded top corners */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SalesAnalyticsChart; 