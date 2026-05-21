"use client";

import { Activity, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export default function Prediction({ data }: { data: any }) {
  if (!data) return null;
  
  if (data.error) {
    return (
      <div className="bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-2 text-yellow-500">
          <AlertCircle className="h-5 w-5" />
          <h3 className="text-xl font-bold">AI Forecast</h3>
        </div>
        <p className="text-neutral-400 text-sm">{data.error}</p>
      </div>
    );
  }

  const isBullish = data.trend === "Bullish";

  return (
    <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-950/80 border border-neutral-800 backdrop-blur-sm rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-20 rounded-full ${isBullish ? 'bg-green-500' : 'bg-red-500'}`} />
      
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-5 w-5 text-indigo-400" />
        <h3 className="text-xl font-bold text-white">AI Forecast</h3>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-xl flex items-center justify-center ${isBullish ? 'bg-green-950/50 text-green-400 border border-green-900/50' : 'bg-red-950/50 text-red-400 border border-red-900/50'}`}>
          {isBullish ? <TrendingUp className="h-8 w-8" /> : <TrendingDown className="h-8 w-8" />}
        </div>
        <div>
          <p className="text-neutral-400 text-sm uppercase font-semibold">Predicted Trend</p>
          <p className={`text-2xl font-bold ${isBullish ? 'text-green-400' : 'text-red-400'}`}>
            {data.trend}
          </p>
        </div>
      </div>
      
      <div className="space-y-3 mt-6">
        <div className="flex justify-between items-center text-sm">
          <span className="text-neutral-400">Current Slope</span>
          <span className="text-white font-mono">{data.slope > 0 ? '+' : ''}{data.slope}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-neutral-400">Model Used</span>
          <span className="text-white">Linear Regression (60d)</span>
        </div>
      </div>
    </div>
  );
}
