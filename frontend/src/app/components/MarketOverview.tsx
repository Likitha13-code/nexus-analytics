import { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function MarketOverview() {
  const [data, setData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketOverview = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await axios.get(`${API_BASE}/api/market/overview`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch market overview:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMarketOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-neutral-900/50 h-20 w-48 rounded-xl border border-neutral-800"></div>
        ))}
      </div>
    );
  }

  if (data.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
      {data.map((item) => {
        const isPositive = item.change >= 0;
        return (
          <div 
            key={item.symbol} 
            className="flex-none min-w-[200px] bg-neutral-900/40 backdrop-blur-md border border-neutral-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-neutral-700 transition-colors"
          >
            <div className="flex justify-between items-start">
              <span className="text-neutral-400 text-sm font-medium">{item.name}</span>
              <Activity className="w-4 h-4 text-neutral-600" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold text-neutral-100">{item.price.toFixed(2)}</span>
              <span className={`text-sm flex items-center gap-1 font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(item.changePercent).toFixed(2)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
