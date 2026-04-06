import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const TrendChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  // data format: [{ year: '2020', count: 5 }]
  return (
    <div className="glass-panel p-4 h-72">
      <h4 className="text-sm font-semibold text-gray-300 mb-4 tracking-wider uppercase">Publication Trend</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#14141e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
            itemStyle={{ color: '#00e5ff' }}
          />
          <Line type="monotone" dataKey="count" stroke="#00e5ff" strokeWidth={3} dot={{ r: 4, fill: '#00e5ff' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const KeywordChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  // data format: [{ keyword: 'AI', count: 12 }]
  
  const colors = ['#6b46c1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#00e5ff', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe'];
  
  return (
    <div className="glass-panel p-4 h-72">
      <h4 className="text-sm font-semibold text-gray-300 mb-4 tracking-wider uppercase">Top Keywords</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
          <XAxis type="number" stroke="#9ca3af" fontSize={12} allowDecimals={false} />
          <YAxis dataKey="keyword" type="category" stroke="#9ca3af" fontSize={12} width={80} />
          <Tooltip 
            cursor={{fill: 'rgba(255,255,255,0.05)'}}
            contentStyle={{ backgroundColor: '#14141e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
