import jwt
import uuid
import hashlib
import requests
from urllib.parse import urlencode
from app.core.config import settings

class UpbitService:
    def __init__(self):
        self.access_key = settings.UPBIT_ACCESS_KEY
        self.secret_key = settings.UPBIT_SECRET_KEY
        self.base_url = "https://api.upbit.com/v1"

    def _create_jwt_token(self):
        payload = {
            'access_key': self.access_key,
            'nonce': str(uuid.uuid4()),
        }
        jwt_token = jwt.encode(payload, self.secret_key)
        return jwt_token

    def get_market_list(self):
        """마켓 코드 조회"""
        url = f"{self.base_url}/market/all"
        response = requests.get(url)
        return response.json()

    def get_current_price(self, market_code: str):
        """현재가 조회"""
        url = f"{self.base_url}/ticker"
        params = {'markets': market_code}
        response = requests.get(url, params=params)
        return response.json()

    def get_account_info(self):
        """계좌 정보 조회"""
        url = f"{self.base_url}/accounts"
        headers = {'Authorization': f'Bearer {self._create_jwt_token()}'}
        response = requests.get(url, headers=headers)
        return response.json()

    def place_order(self, market: str, side: str, volume: str = None, price: str = None):
        """주문하기"""
        url = f"{self.base_url}/orders"
        params = {
            'market': market,
            'side': side,
        }
        if volume:
            params['volume'] = volume
        if price:
            params['price'] = price

        query_string = urlencode(params)
        query_hash = hashlib.sha512(query_string.encode()).hexdigest()

        payload = {
            'access_key': self.access_key,
            'nonce': str(uuid.uuid4()),
            'query_hash': query_hash,
            'query_hash_alg': 'SHA512',
        }

        jwt_token = jwt.encode(payload, self.secret_key)
        headers = {'Authorization': f'Bearer {jwt_token}'}
        
        response = requests.post(url, params=params, headers=headers)
        return response.json()

    def get_candles(self, market_code: str, unit: str = "days", count: int = 30):
        """
        캔들 데이터 조회 (unit: days, minutes/1, minutes/60 등)
        """
        if unit == "days":
            url = f"https://api.upbit.com/v1/candles/days"
            params = {"market": market_code, "count": count}
        elif unit.startswith("minutes/"):
            minute_unit = unit.split("/")[1]
            url = f"https://api.upbit.com/v1/candles/minutes/{minute_unit}"
            params = {"market": market_code, "count": count}
        else:
            raise ValueError("지원하지 않는 캔들 단위입니다.")
        response = requests.get(url, params=params)
        return response.json() 