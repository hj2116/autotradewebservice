from typing import Dict, List, Optional
import aiohttp
from datetime import datetime, timedelta
import jwt
import uuid
import hashlib
from urllib.parse import urlencode
import numpy as np

class UpbitService:
    def __init__(self, access_key: str, secret_key: str):
        self.access_key = access_key
        self.secret_key = secret_key
        self.base_url = "https://api.upbit.com/v1"

    async def get_daily_candles(self, market: str, count: int = 21) -> List[Dict]:
        """
        최근 일봉 데이터를 가져옵니다.
        Args:
            market: 마켓 코드 (예: KRW-BTC)
            count: 가져올 캔들 개수 (기본값: 21)
        Returns:
            List[Dict]: 일봉 데이터 리스트
        """
        url = f"{self.base_url}/candles/days"
        params = {
            'market': market,
            'count': count,
            'to': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return data
                else:
                    raise Exception(f"Failed to get daily candles: {response.status}")

    async def calculate_volatility(self, market: str, window: int = 20) -> Dict:
        """
        일별 종가 데이터의 변동성을 계산합니다.
        Args:
            market: 마켓 코드 (예: KRW-BTC)
            window: 변동성 계산에 사용할 기간 (기본값: 20)
        Returns:
            Dict: {
                'volatility': float,  # 변동성
                'data': List[Dict]  # 사용된 데이터
            }
        """
        # 일봉 데이터 가져오기 (window + 1개의 데이터 필요)
        candles = await self.get_daily_candles(market, window + 1)
        
        # 종가 데이터 추출 (최신 데이터가 앞에 오므로 역순으로 정렬)
        closes = np.array([candle['trade_price'] for candle in reversed(candles)])
        
        # 수익률 계산 (전일 대비)
        returns = np.diff(closes) / closes[:-1]
        
        # 변동성 계산
        volatility = np.std(returns)
        
        return {
            'volatility': float(volatility),
            'data': [
                {
                    'date': candle['candle_date_time_kst'],
                    'close': candle['trade_price']
                }
                for candle in reversed(candles)
            ]
        }

    # ... 기존 코드 ... 