"use client";

import { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function PriceChart({ data, indicators }: { data: any[], indicators?: any[] }) {
  const [showRSI, setShowRSI] = useState(false);
  const [showMACD, setShowMACD] = useState(false);

  if (!data || !Array.isArray(data) || data.length === 0) return <div className="p-4 text-neutral-400 text-center">No data available or invalid data format.</div>;

  // Merge indicator data into main data if available
  const mergedData = data.map((d, i) => {
    if (indicators && indicators[i]) {
      return { ...d, ...indicators[i] };
    }
    return d;
  });

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex gap-4 px-2">
        <label className="flex items-center gap-2 text-sm text-neutral-300">
          <input type="checkbox" checked={showRSI} onChange={(e) => setShowRSI(e.target.checked)} className="accent-indigo-500" />
          Show RSI
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-300">
          <input type="checkbox" checked={showMACD} onChange={(e) => setShowMACD(e.target.checked)} className="accent-indigo-500" />
          Show MACD
        </label>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={mergedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
            <XAxis 
              dataKey="Date" 
              stroke="#737373" 
              tick={{ fill: '#737373', fontSize: 12 }} 
              tickFormatter={(tick) => {
                const date = new Date(tick);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
              minTickGap={30}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              stroke="#737373" 
              tick={{ fill: '#737373', fontSize: 12 }}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', borderRadius: '8px' }}
              itemStyle={{ color: '#e5e5e5' }}
              labelStyle={{ color: '#a3a3a3' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Line type="monotone" dataKey="Close" stroke="#818cf8" strokeWidth={2} dot={false} name="Price" />
            <Line type="monotone" dataKey="SMA_20" stroke="#f59e0b" strokeWidth={1} dot={false} name="SMA 20" />
            <Line type="monotone" dataKey="SMA_50" stroke="#10b981" strokeWidth={1} dot={false} name="SMA 50" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {showRSI && (
        <div className="h-32 border-t border-neutral-800 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mergedData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="Date" hide />
              <YAxis domain={[0, 100]} stroke="#737373" tick={{ fill: '#737373', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="RSI" stroke="#a78bfa" strokeWidth={1.5} dot={false} name="RSI (14)" />
              {/* Overbought/Oversold lines */}
              <Line type="step" dataKey={() => 70} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} dot={false} name="Overbought" />
              <Line type="step" dataKey={() => 30} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} dot={false} name="Oversold" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {showMACD && (
        <div className="h-40 border-t border-neutral-800 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mergedData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="Date" hide />
              <YAxis stroke="#737373" tick={{ fill: '#737373', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="MACD_Diff" fill="#6366f1" name="Histogram" />
              <Line type="monotone" dataKey="MACD" stroke="#ec4899" strokeWidth={1.5} dot={false} name="MACD" />
              <Line type="monotone" dataKey="MACD_Signal" stroke="#eab308" strokeWidth={1.5} dot={false} name="Signal" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
