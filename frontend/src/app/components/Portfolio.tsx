import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Briefcase, Plus, X } from 'lucide-react';
import axios from 'axios';

interface PortfolioItem {
  id?: string;
  ticker: string;
  shares: number;
  average_price: number;
  current_price?: number;
}

export default function Portfolio({ isGuest, user }: { isGuest: boolean, user: any }) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [newTicker, setNewTicker] = useState('');
  const [newShares, setNewShares] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [loadingPrices, setLoadingPrices] = useState(false);

  useEffect(() => {
    fetchPortfolio();
  }, [isGuest, user]);

  const fetchPortfolio = async () => {
    let rawItems: PortfolioItem[] = [];
    if (isGuest) {
      const local = localStorage.getItem('guest_portfolio');
      if (local) rawItems = JSON.parse(local);
    } else if (user) {
      const { data } = await supabase.from('portfolio').select('*').eq('user_id', user.id);
      if (data) rawItems = data;
    }

    if (rawItems.length > 0) {
      updateWithCurrentPrices(rawItems);
    } else {
      setItems([]);
    }
  };

  const updateWithCurrentPrices = async (portfolio: PortfolioItem[]) => {
    setLoadingPrices(true);
    const updated = await Promise.all(portfolio.map(async (item) => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await axios.get(`${API_BASE}/api/stock/${item.ticker}/fundamentals`);
        return { ...item, current_price: res.data.currentPrice };
      } catch (err) {
        return item; // Keep as is if fetch fails
      }
    }));
    setItems(updated);
    setLoadingPrices(false);
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker || !newShares || !newPrice) return;
    
    const ticker = newTicker.toUpperCase();
    const newItem: PortfolioItem = {
      ticker,
      shares: parseFloat(newShares),
      average_price: parseFloat(newPrice)
    };

    let updated = [...items, newItem];
    setItems(updated);
    
    // Clear form
    setNewTicker(''); setNewShares(''); setNewPrice('');

    if (isGuest) {
      localStorage.setItem('guest_portfolio', JSON.stringify(updated));
    } else if (user) {
      await supabase.from('portfolio').insert({ ...newItem, user_id: user.id });
      // Refetch to get IDs
      fetchPortfolio();
    } else {
       updateWithCurrentPrices(updated);
    }
  };

  const removeItem = async (index: number, id?: string) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);

    if (isGuest) {
      localStorage.setItem('guest_portfolio', JSON.stringify(updated));
    } else if (user && id) {
      await supabase.from('portfolio').delete().eq('id', id);
    }
  };

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <Briefcase className="w-5 h-5 text-emerald-500" />
        <h3 className="text-xl font-bold text-white">Portfolio</h3>
      </div>

      <form onSubmit={addItem} className="flex gap-2 mb-4 text-sm">
        <input
          type="text"
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value)}
          placeholder="Ticker"
          className="w-1/3 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-2 text-neutral-200 focus:outline-none focus:border-indigo-500"
        />
        <input
          type="number"
          value={newShares}
          onChange={(e) => setNewShares(e.target.value)}
          placeholder="Shares"
          className="w-1/3 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-2 text-neutral-200 focus:outline-none focus:border-indigo-500"
        />
        <input
          type="number"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          placeholder="Avg Price"
          className="w-1/3 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-2 text-neutral-200 focus:outline-none focus:border-indigo-500"
        />
        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </form>

      <div className="space-y-3">
        {items.map((item, index) => {
          const totalCost = item.shares * item.average_price;
          const currentValue = item.current_price ? item.shares * item.current_price : totalCost;
          const profit = currentValue - totalCost;
          const isProfit = profit >= 0;

          return (
            <div key={item.id || index} className="bg-neutral-800/30 rounded-lg p-3 group relative">
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono font-bold text-white">{item.ticker}</span>
                <span className={`font-mono font-medium ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${profit > 0 ? '+' : ''}{profit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-neutral-400">
                <span>{item.shares} shrs @ ${item.average_price}</span>
                <span>{item.current_price ? `$${item.current_price} curr` : 'Loading...'}</span>
              </div>
              <button 
                onClick={() => removeItem(index, item.id)}
                className="absolute -top-2 -right-2 bg-neutral-900 border border-neutral-700 text-neutral-400 rounded-full p-1 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:border-red-400 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )
        })}
        {items.length === 0 && (
          <p className="text-sm text-neutral-500 text-center py-4">No assets in portfolio.</p>
        )}
      </div>
    </div>
  );
}
