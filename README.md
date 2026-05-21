# Nexus Analytics: Advanced Stock Market Intelligence

Nexus Analytics is a full-stack stock market analysis platform that provides real-time stock data, fundamental analysis, technical indicators, machine learning predictions, and portfolio management. It features a modern, responsive UI built with Next.js and a robust data pipeline powered by Python (Flask) and Yahoo Finance.

## 🚀 Features

- **Real-Time Data & Historical Charts**: View interactive stock price charts with customizable timeframes.
- **Fundamental Analysis**: Access key metrics such as P/E Ratio, Market Cap, Dividend Yield, and 52-week highs/lows.
- **Technical Indicators**: Toggle visual overlays for SMA, RSI, and MACD to analyze price action.
- **AI Trend Prediction**: Basic linear regression model to forecast short-term bullish or bearish trends.
- **Market Overview & News**: Keep a pulse on the market with live index tracking (S&P 500, Dow, NASDAQ) and a dynamic news feed for specific tickers.
- **Watchlist & Portfolio Management**: 
  - **Guest Mode**: Save your favorite stocks and portfolio holdings locally in your browser.
  - **Cloud Mode**: Sign up/in via Supabase to sync your watchlist and portfolio across devices.
- **Stock Screener**: Filter top tech and financial stocks by sector and maximum P/E ratio.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Database & Auth (Cloud Mode)**: [Supabase](https://supabase.com/)

### Backend
- **Framework**: [Flask](https://flask.palletsprojects.com/) (Python)
- **Financial Data API**: [yfinance](https://pypi.org/project/yfinance/)
- **Technical Analysis**: [ta](https://github.com/bukosabino/ta) (Technical Analysis Library in Python)
- **Machine Learning**: [scikit-learn](https://scikit-learn.org/) (Linear Regression)
- **Data Manipulation**: [pandas](https://pandas.pydata.org/), [NumPy](https://numpy.org/)

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (3.9+)
- A [Supabase](https://supabase.com/) account (optional, for Cloud Mode)

---

## 💻 Installation & Setup

You will need to run the backend and frontend simultaneously in two separate terminal windows.

### 1. Backend Setup (Flask API)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   - **Windows**: `.\venv\Scripts\activate` (or run `.\venv\Scripts\python.exe main.py` directly if you face execution policy errors)
   - **Mac/Linux**: `source venv/bin/activate`
3. Install dependencies (if not already installed):
   ```bash
   pip install flask flask-cors yfinance pandas numpy scikit-learn ta
   ```
4. Start the server:
   ```bash
   python main.py
   ```
   *The backend will run on `http://localhost:8000`*

### 2. Frontend Setup (Next.js)

1. Open a **second** terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node modules:
   ```bash
   npm install
   ```
3. Set up your environment variables for Supabase (See **Supabase Configuration** below).
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:3000`*

---

## ☁️ Supabase Configuration (For Cloud Mode)

To enable Cloud Mode (saving data to an online database with user authentication), you must configure Supabase.

1. Create a free project at [Supabase](https://supabase.com/).
2. In your Supabase Dashboard, navigate to **Settings > API** to find your **Project URL** and **Anon Key**.
3. Create a `.env.local` file inside the `frontend` folder and add your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Navigate to the **SQL Editor** in your Supabase Dashboard and run the following script to create the necessary tables and security policies:

   ```sql
   -- Create Watchlist Table
   create table if not exists public.watchlist (
       id uuid default gen_random_uuid() primary key,
       created_at timestamp with time zone default timezone('utc'::text, now()) not null,
       user_id uuid references auth.users not null,
       ticker text not null
   );

   -- Create Portfolio Table
   create table if not exists public.portfolio (
       id uuid default gen_random_uuid() primary key,
       created_at timestamp with time zone default timezone('utc'::text, now()) not null,
       user_id uuid references auth.users not null,
       ticker text not null,
       shares numeric not null,
       average_price numeric not null
   );

   -- Enable Row Level Security (RLS)
   alter table public.watchlist enable row level security;
   alter table public.portfolio enable row level security;

   -- Create Security Policies for Watchlist
   create policy "Allow individual read access" on public.watchlist for select using ( auth.uid() = user_id );
   create policy "Allow individual insert access" on public.watchlist for insert with check ( auth.uid() = user_id );
   create policy "Allow individual delete access" on public.watchlist for delete using ( auth.uid() = user_id );

   -- Create Security Policies for Portfolio
   create policy "Allow individual read access" on public.portfolio for select using ( auth.uid() = user_id );
   create policy "Allow individual insert access" on public.portfolio for insert with check ( auth.uid() = user_id );
   create policy "Allow individual delete access" on public.portfolio for delete using ( auth.uid() = user_id );
   ```

---

## 📖 Usage

1. Open [http://localhost:3000](http://localhost:3000) in your browser.
2. Use the search bar to look up any stock ticker (e.g., AAPL, TSLA, NVDA).
3. Toggle the **Show RSI** and **Show MACD** checkboxes to view technical momentum indicators.
4. Switch to the **Screener** tab to filter popular stocks by sector or maximum P/E ratio.
5. Switch to the **Portfolio** tab to add your own holdings and track live profit/loss.
6. Click **"Cloud Sign In"** at the top right to create an account and permanently save your portfolio and watchlist.

---
*Built with Python, Next.js, and Supabase.*
