"use client";

import { Info, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Fundamentals({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-5 w-5 text-indigo-400" />
        <h3 className="text-xl font-bold text-white">Fundamentals</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-neutral-950/50 rounded-xl p-4 border border-neutral-800">
          <p className="text-neutral-500 text-xs uppercase font-semibold mb-1">Market Cap</p>
          <p className="text-white font-mono">{typeof data.marketCap === 'number' ? `$${(data.marketCap / 1e9).toFixed(2)}B` : data.marketCap}</p>
        </div>
        <div className="bg-neutral-950/50 rounded-xl p-4 border border-neutral-800">
          <p className="text-neutral-500 text-xs uppercase font-semibold mb-1">P/E Ratio</p>
          <p className="text-white font-mono">{data.peRatio}</p>
        </div>
        <div className="bg-neutral-950/50 rounded-xl p-4 border border-neutral-800">
          <p className="text-neutral-500 text-xs uppercase font-semibold mb-1">52W High</p>
          <p className="text-white font-mono">${data.fiftyTwoWeekHigh}</p>
        </div>
        <div className="bg-neutral-950/50 rounded-xl p-4 border border-neutral-800">
          <p className="text-neutral-500 text-xs uppercase font-semibold mb-1">52W Low</p>
          <p className="text-white font-mono">${data.fiftyTwoWeekLow}</p>
        </div>
      </div>
      
      {data.summary && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-neutral-400" />
            <span className="text-sm font-semibold text-neutral-300">Company Profile</span>
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
            {data.summary}
          </p>
        </div>
      )}
    </div>
  );
}
