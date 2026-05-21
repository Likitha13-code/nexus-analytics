"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, AlertCircle, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PriceChart from './PriceChart';
import Fundamentals from './Fundamentals';
import Prediction from './Prediction';
import MarketOverview from './MarketOverview';
import NewsFeed from './NewsFeed';
import Watchlist from './Watchlist';
import Portfolio from './Portfolio';
import Screener from './Screener';

export default function Dashboard() {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [history, setHistory] = useState<any>(null);
  const [fundamentals, setFundamentals] = useState<any>(null);
  const [indicators, setIndicators] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [news, setNews] = useState<any>(null);

  // Auth State
  const [isGuest, setIsGuest] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // View state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'screener' | 'portfolio'>('dashboard');

  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setIsGuest(false);
    });
    return () => { authListener.subscription.unsubscribe(); };
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    if (session?.user) setIsGuest(false);
    setAuthLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) alert("Error signing up: " + error.message);
    else {
      alert("Success! You are now signed in.");
      setShowAuthModal(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Error signing in: " + error.message);
    else setShowAuthModal(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsGuest(true);
  };

  const handleSearch = (searchTicker: string) => {
    setTicker(searchTicker);
    setActiveTab('dashboard');
    fetchStockData(searchTicker);
  };

  const fetchStockData = async (t: string) => {
    if (!t) return;
    setLoading(true);
    setError('');
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const [histRes, fundRes, indRes, predRes, newsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/stock/${t.toUpperCase()}/history`),
        axios.get(`${API_BASE}/api/stock/${t.toUpperCase()}/fundamentals`),
        axios.get(`${API_BASE}/api/stock/${t.toUpperCase()}/indicators`),
        axios.get(`${API_BASE}/api/stock/${t.toUpperCase()}/predict`),
        axios.get(`${API_BASE}/api/stock/${t.toUpperCase()}/news`).catch(() => ({ data: [] }))
      ]);

      setHistory(histRes.data);
      setFundamentals(fundRes.data);
      setIndicators(indRes.data);
      setPrediction(predRes.data);
      setNews(newsRes.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-10 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Auth Bar */}
        <div className="flex justify-end items-center gap-4 text-sm">
          <span className="text-neutral-400">Mode: {isGuest ? 'Guest (Local Storage)' : 'Cloud (Supabase)'}</span>
          {!isGuest && user ? (
             <button onClick={handleLogout} className="flex items-center gap-1 text-red-400 hover:text-red-300">
               <LogOut className="w-4 h-4"/> Logout
             </button>
          ) : (
             <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
               <LogIn className="w-4 h-4"/> Cloud Sign In
             </button>
          )}
        </div>

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm">
              <h2 className="text-2xl font-bold mb-6 text-white text-center">Cloud Sign In</h2>
              <form className="space-y-4">
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <div className="flex gap-4 pt-4">
                  <button onClick={handleSignIn} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors">
                    Log In
                  </button>
                  <button onClick={handleSignUp} className="w-full bg-neutral-800 hover:bg-neutral-700 text-white py-2 rounded-lg font-medium transition-colors">
                    Sign Up
                  </button>
                </div>
              </form>
              <button 
                onClick={() => setShowAuthModal(false)}
                className="w-full mt-4 text-neutral-500 hover:text-neutral-300 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Header & Search */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              Nexus Analytics
            </h1>
            <p className="text-neutral-400 text-sm mt-1">Advanced Market Intelligence</p>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(ticker); }} className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-indigo-400 transition-colors">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Enter ticker (e.g., AAPL, TSLA)"
              className="block w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl leading-5 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-inner"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
            />
            <button type="submit" className="hidden" />
          </form>
        </header>

        <MarketOverview />

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-neutral-800 pb-2">
           <button 
             onClick={() => setActiveTab('dashboard')} 
             className={`px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:bg-neutral-900'}`}
           >
             Dashboard
           </button>
           <button 
             onClick={() => setActiveTab('screener')} 
             className={`px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === 'screener' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:bg-neutral-900'}`}
           >
             Screener
           </button>
           <button 
             onClick={() => setActiveTab('portfolio')} 
             className={`px-4 py-2 font-medium rounded-lg transition-colors ${activeTab === 'portfolio' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:bg-neutral-900'}`}
           >
             Portfolio
           </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 text-red-400 bg-red-950/30 border border-red-900/50 rounded-xl">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Tab Content */}
        {!loading && activeTab === 'screener' && <Screener onSelect={handleSearch} />}
        {!loading && activeTab === 'portfolio' && <Portfolio isGuest={isGuest} user={user} />}

        {!loading && activeTab === 'dashboard' && history && fundamentals && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Left: Watchlist */}
            <div className="lg:col-span-1 space-y-8">
               <Watchlist onSelect={handleSearch} isGuest={isGuest} user={user} />
            </div>

            {/* Main Column (Chart + News) */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{fundamentals.name}</h2>
                    <p className="text-neutral-400 text-sm">{fundamentals.sector} • {fundamentals.industry}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-mono text-white">${fundamentals.currentPrice}</p>
                  </div>
                </div>
                
                <div className="h-[600px] flex flex-col gap-4">
                  <PriceChart data={history} indicators={indicators} />
                </div>
              </div>
              
              <NewsFeed data={news} />
            </div>

            {/* Sidebar Right (Fundamentals + AI) */}
            <div className="lg:col-span-1 space-y-8">
              <Prediction data={prediction} />
              <Fundamentals data={fundamentals} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
