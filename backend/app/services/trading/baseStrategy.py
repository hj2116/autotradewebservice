from abc import ABC, abstractmethod
from typing import Dict, List, Optional
from datetime import datetime

class BaseStrategy(ABC):
    def __init__(self, market: str, parameters: Dict):
        self.market = market
        self.parameters = parameters
        self.position = False  # 현재 포지션 상태 (True: 매수, False: 매도)
        self.last_signal = None  # 마지막 신호 시간

    @abstractmethod
    def calculate_signals(self, candles: List[Dict]) -> Dict:
        """
        캔들 데이터를 기반으로 매매 신호를 계산합니다.
        Returns:
            Dict: {
                'signal': 'buy' | 'sell' | 'hold',
                'price': float,
                'timestamp': datetime,
                'indicators': Dict  # 전략별 지표값들
            }
        """
        pass

    def should_execute_trade(self, signal: Dict) -> bool:
        """
        신호가 실제 거래로 이어져야 하는지 확인합니다.
        중복 신호 방지, 최소 거래 간격 등을 체크합니다.
        """
        if not signal:
            return False

        current_time = datetime.now()
        if self.last_signal:
            # 최소 거래 간격 체크 (예: 1분)
            if (current_time - self.last_signal).total_seconds() < 60:
                return False

        self.last_signal = current_time
        return True

    def update_position(self, signal: Dict) -> None:
        """
        포지션 상태를 업데이트합니다.
        """
        if signal['signal'] == 'buy':
            self.position = True
        elif signal['signal'] == 'sell':
            self.position = False 