import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Star, X } from 'lucide-react';

interface WatchlistProps {
  onSelect: (ticker: string) => void;
  isGuest: boolean;
  user: any;
}

export default function Watchlist({ onSelect, isGuest, user }: WatchlistProps) {
  const [items, setItems] = useState<string[]>([]);
  const [newTicker, setNewTicker] = useState('');

  useEffect(() => {
    fetchWatchlist();
  }, [isGuest, user]);

  const fetchWatchlist = async () => {
    if (isGuest) {
      const local = localStorage.getItem('guest_watchlist');
      if (local) setItems(JSON.parse(local));
      else setItems(['AAPL', 'MSFT', 'GOOGL']);
    } else if (user) {
      // Fetch from Supabase
      const { data, error } = await supabase
        .from('watchlist')
        .select('ticker')
        .eq('user_id', user.id);
      
      if (data && !error) {
        setItems(data.map(d => d.ticker));
      }
    }
  };

  const addTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker) return;
    
    const ticker = newTicker.toUpperCase();
    if (items.includes(ticker)) return;
    
    const updated = [...items, ticker];
    setItems(updated);
    setNewTicker('');

    if (isGuest) {
      localStorage.setItem('guest_watchlist', JSON.stringify(updated));
    } else if (user) {
      await supabase.from('watchlist').insert({ user_id: user.id, ticker });
    }
  };

  const removeTicker = async (ticker: string) => {
    const updated = items.filter(t => t !== ticker);
    setItems(updated);

    if (isGuest) {
      localStorage.setItem('guest_watchlist', JSON.stringify(updated));
    } else if (user) {
      await supabase.from('watchlist').delete().match({ user_id: user.id, ticker });
    }
  };

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <h3 className="text-xl font-bold text-white">Watchlist {isGuest && '(Guest)'}</h3>
        </div>
      </div>

      <form onSubmit={addTicker} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value)}
          placeholder="Add ticker..."
          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
          Add
        </button>
      </form>

      <div className="space-y-2">
        {items.map(ticker => (
          <div key={ticker} className="flex items-center justify-between bg-neutral-800/30 rounded-lg p-3 group hover:bg-neutral-800/50 transition-colors">
            <button 
              onClick={() => onSelect(ticker)}
              className="font-mono font-medium text-neutral-300 hover:text-white transition-colors text-left flex-1"
            >
              {ticker}
            </button>
            <button 
              onClick={() => removeTicker(ticker)}
              className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-neutral-500 text-center py-4">Your watchlist is empty.</p>
        )}
      </div>
    </div>
  );
}
