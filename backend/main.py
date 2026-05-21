from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import pandas as pd
import ta
import numpy as np
from sklearn.linear_model import LinearRegression

app = Flask(__name__)
# Allow CORS for local frontend
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route("/api/stock/<ticker>/history", methods=["GET"])
def get_stock_history(ticker):
    try:
        period = request.args.get("period", "1y")
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        if hist.empty:
            return jsonify({"detail": "No data found for ticker"}), 404
        
        # Reset index to make Date a column
        hist = hist.reset_index()
        # Convert Date to string
        hist['Date'] = hist['Date'].dt.strftime('%Y-%m-%d')
        
        # We need Date, Open, High, Low, Close, Volume
        result = hist[['Date', 'Open', 'High', 'Low', 'Close', 'Volume']].to_dict(orient="records")
        return jsonify(result)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500

@app.route("/api/stock/<ticker>/fundamentals", methods=["GET"])
def get_stock_fundamentals(ticker):
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        
        fundamentals = {
            "name": info.get("longName", ticker),
            "sector": info.get("sector", "N/A"),
            "industry": info.get("industry", "N/A"),
            "marketCap": info.get("marketCap", "N/A"),
            "peRatio": info.get("trailingPE", "N/A"),
            "forwardPE": info.get("forwardPE", "N/A"),
            "dividendYield": info.get("dividendYield", "N/A"),
            "fiftyTwoWeekHigh": info.get("fiftyTwoWeekHigh", "N/A"),
            "fiftyTwoWeekLow": info.get("fiftyTwoWeekLow", "N/A"),
            "currentPrice": info.get("currentPrice", "N/A"),
            "summary": info.get("longBusinessSummary", "")
        }
        return jsonify(fundamentals)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500

@app.route("/api/stock/<ticker>/indicators", methods=["GET"])
def get_stock_indicators(ticker):
    try:
        period = request.args.get("period", "1y")
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        if hist.empty:
            return jsonify({"detail": "No data found for ticker"}), 404
        
        # Calculate indicators using `ta` library
        # RSI
        hist['RSI'] = ta.momentum.RSIIndicator(close=hist['Close'], window=14).rsi()
        
        # MACD
        macd = ta.trend.MACD(close=hist['Close'])
        hist['MACD'] = macd.macd()
        hist['MACD_Signal'] = macd.macd_signal()
        hist['MACD_Diff'] = macd.macd_diff()
        
        # Moving Averages
        hist['SMA_20'] = ta.trend.SMAIndicator(close=hist['Close'], window=20).sma_indicator()
        hist['SMA_50'] = ta.trend.SMAIndicator(close=hist['Close'], window=50).sma_indicator()
        
        # Reset index
        hist = hist.reset_index()
        hist['Date'] = hist['Date'].dt.strftime('%Y-%m-%d')
        
        # Fill NaNs with None for JSON serialization
        hist = hist.replace({np.nan: None})
        
        result = hist[['Date', 'RSI', 'MACD', 'MACD_Signal', 'MACD_Diff', 'SMA_20', 'SMA_50']].to_dict(orient="records")
        return jsonify(result)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500

@app.route("/api/stock/<ticker>/predict", methods=["GET"])
def predict_stock_trend(ticker):
    # Basic Linear Regression on last 60 days to predict next 7 days
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period="6mo")
        if hist.empty:
            return jsonify({"detail": "No data found"}), 404
            
        closes = hist['Close'].values
        if len(closes) < 30:
            return jsonify({"error": "Not enough data for prediction"})
            
        # Use last 60 days if available
        closes = closes[-60:]
        
        X = np.arange(len(closes)).reshape(-1, 1)
        y = closes
        
        model = LinearRegression()
        model.fit(X, y)
        
        # Predict next 7 days
        future_X = np.arange(len(closes), len(closes) + 7).reshape(-1, 1)
        predictions = model.predict(future_X)
        
        # Current trend (slope)
        slope = model.coef_[0]
        trend = "Bullish" if slope > 0 else "Bearish"
        
        return jsonify({
            "trend": trend,
            "slope": round(slope, 4),
            "historical_closes": closes.tolist(),
            "predictions": predictions.tolist()
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500

@app.route("/api/market/overview", methods=["GET"])
def get_market_overview():
    try:
        # Tickers for S&P 500, Dow Jones, NASDAQ
        tickers = ["^GSPC", "^DJI", "^IXIC"]
        overview = []
        for t in tickers:
            stock = yf.Ticker(t)
            hist = stock.history(period="2d")
            if len(hist) >= 2:
                prev_close = hist['Close'].iloc[-2]
                curr_close = hist['Close'].iloc[-1]
                change = curr_close - prev_close
                change_percent = (change / prev_close) * 100
                name = "S&P 500" if t == "^GSPC" else "Dow Jones" if t == "^DJI" else "NASDAQ"
                overview.append({
                    "symbol": t,
                    "name": name,
                    "price": round(curr_close, 2),
                    "change": round(change, 2),
                    "changePercent": round(change_percent, 2)
                })
        return jsonify(overview)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500

@app.route("/api/stock/<ticker>/news", methods=["GET"])
def get_stock_news(ticker):
    try:
        stock = yf.Ticker(ticker)
        raw_news = stock.news
        
        formatted_news = []
        for item in raw_news:
            try:
                if "content" in item:
                    content = item["content"]
                    pub_time = 0
                    if content.get("pubDate"):
                        pub_time = int(pd.to_datetime(content["pubDate"]).timestamp())
                        
                    formatted_news.append({
                        "title": content.get("title", ""),
                        "publisher": content.get("provider", {}).get("displayName", ""),
                        "link": content.get("clickThroughUrl", {}).get("url", ""),
                        "providerPublishTime": pub_time
                    })
                else:
                    # Fallback for old format
                    formatted_news.append({
                        "title": item.get("title", ""),
                        "publisher": item.get("publisher", ""),
                        "link": item.get("link", ""),
                        "providerPublishTime": item.get("providerPublishTime", 0)
                    })
            except:
                pass
                
        return jsonify(formatted_news[:5])
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"detail": str(e)}), 500

if __name__ == "__main__":
    app.run(port=8000, debug=True)
