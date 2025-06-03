from typing import Dict, List
import numpy as np

class InverseVolatilityStrategy:
    def __init__(self, upbit_service, parameters: Dict):
        self.upbit_service = upbit_service
        self.volatility_window = parameters.get('volatility_window', 20)
        self.tickers = parameters.get("tickers", [])

    async def calculate_portfolio_weights(self) -> Dict:
        if len(self.tickers) < 2:
            return {"error": "2개 이상의 티커가 필요합니다."}

        volatilities = []

        for ticker in self.tickers:
            candles = await self.upbit_service.get_daily_candles(ticker, self.volatility_window)
            closes = [candle['trade_price'] for candle in candles]
            pct_changes = []
            for i in range(len(closes)-1):
                pct_changes.append((closes[i+1]-closes[i])/closes[i])
            volatilities.append(np.std(pct_changes))
        if 0 in volatilities:
            return {"error": "0 변동성 발견"}

        weights = np.array([1 / v for v in volatilities])
        weights = weights / np.sum(weights)
        return {ticker: float(weight) for ticker, weight in zip(self.tickers, weights)} 