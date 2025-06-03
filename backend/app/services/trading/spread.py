from typing import Dict, List
import numpy as np
from .baseStrategy import BaseStrategy

class SpreadStrategy(BaseStrategy):
    def __init__(self, upbitService, parameters: Dict):
        self.upbitService = upbitService
        self.ticker1 = parameters.get('tickers', [])[0]
        self.ticker2 = parameters.get('tickers', [])[1]
        self.longEntryThreshold = float(parameters.get('longEntryThreshold', -1))
        self.shortEntryThreshold = float(parameters.get('shortEntryThreshold', 1))
        self.longExitThreshold = float(parameters.get('longExitThreshold', 1))
        self.shortExitThreshold = float(parameters.get('shortExitThreshold', -1))
        self.lookbackDays = int(parameters.get('lookbackDays', 20))
        self.zScoreDays = int(parameters.get('zScoreDays', 60))
        self.holdingPeriod = int(parameters.get('holdingPeriod', 5))

    
    async def calculate_signals(self):
        candles1 = []
        candles2 = []
        candles1_from_api = await self.upbitService.get_daily_candles(self.ticker1, self.lookbackDays + 2)
        candles2_from_api = await self.upbitService.get_daily_candles(self.ticker2, self.lookbackDays + 2)

        candles1.extend(candles1_from_api)
        candles2.extend(candles2_from_api)
        candleCloses1= [candle['close'] for candle in candles1[1:]]
        candleCloses2 = [candle['close'] for candle in candles2[1:]]
        candles1Returns  = []
        candles2Returns = []

        i = 0
        while(i < len(candleCloses1)):
            candles1Returns.append(candleCloses1[i]/candleCloses1[i-1])
            candles2Returns.append(candleCloses2[i]/candleCloses2[i-1])
            i += 1

        candles1zScore = (candles1Returns - candles1Returns.mean())/candles1Returns.std()
        candles2zScore = (candles2Returns - candles2Returns.mean())/candles2Returns.std()



        if(candles1zScore > self.longEntryThreshold and candles2zScore < self.shortEntryThreshold):
            return {"signal": "long", "message": "will close long position tomorrow"}
        elif(candles1zScore < self.shortEntryThreshold and candles2zScore > self.longEntryThreshold):
