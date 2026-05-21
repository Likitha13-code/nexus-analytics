import { useState, useEffect } from 'react';
import axios from 'axios';
import { Filter, Search } from 'lucide-react';

const SCREENER_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'JNJ'];

export default function Screener({ onSelect }: { onSelect: (ticker: string) => void }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [sectorFilter, setSectorFilter] = useState('All');
  const [maxPe, setMaxPe] = useState('');

  useEffect(() => {
    const fetchScreenerData = async () => {
      setLoading(true);
      const results = await Promise.all(SCREENER_TICKERS.map(async (ticker) => {
        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const res = await axios.get(`${API_BASE}/api/stock/${ticker}/fundamentals`);
          return { ticker, ...res.data };
        } catch (e) {
          return null;
        }
      }));
      setData(results.filter(r => r !== null));
      setLoading(false);
    };
    fetchScreenerData();
  }, []);

  const sectors = ['All', ...Array.from(new Set(data.map(d => d.sector).filter(s => s && s !== 'N/A')))];

  const filteredData = data.filter(d => {
    if (sectorFilter !== 'All' && d.sector !== sectorFilter) return false;
    if (maxPe && d.peRatio !== 'N/A' && parseFloat(d.peRatio) > parseFloat(maxPe)) return false;
    return true;
  });

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm rounded-2xl p-6 shadow-xl w-full">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-cyan-400" />
        <h3 className="text-xl font-bold text-white">Stock Screener</h3>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select 
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-indigo-500"
        >
          {sectors.map(s => <option key={s as string} value={s as string}>{s}</option>)}
        </select>
        
        <input 
          type="number"
          placeholder="Max P/E Ratio"
          value={maxPe}
          onChange={(e) => setMaxPe(e.target.value)}
          className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
           {[1, 2, 3].map(i => <div key={i} className="h-10 bg-neutral-800/50 rounded-lg"></div>)}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-neutral-400">
            <thead className="text-xs text-neutral-500 uppercase bg-neutral-900/50 border-b border-neutral-800">
              <tr>
                <th className="px-4 py-3">Ticker</th>
                <th className="px-4 py-3">Sector</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">P/E Ratio</th>
                <th className="px-4 py-3">Mkt Cap</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(d => (
                <tr key={d.ticker} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-white">{d.ticker}</td>
                  <td className="px-4 py-3">{d.sector}</td>
                  <td className="px-4 py-3">${d.currentPrice}</td>
                  <td className="px-4 py-3">{d.peRatio !== 'N/A' ? parseFloat(d.peRatio).toFixed(2) : 'N/A'}</td>
                  <td className="px-4 py-3">{d.marketCap !== 'N/A' ? `$${(d.marketCap / 1e9).toFixed(2)}B` : 'N/A'}</td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => onSelect(d.ticker)}
                      className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      <Search className="w-4 h-4"/> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && <p className="text-center py-6">No stocks match your criteria.</p>}
        </div>
      )}
    </div>
  );
}
