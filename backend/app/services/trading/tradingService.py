from typing import Dict, List, Optional
from datetime import datetime
import asyncio
from .baseStrategy import BaseStrategy
from .trendFollowing import TrendFollowingStrategy
from ..upbit_service import UpbitService

class TradingService:
    def __init__(self, upbit_service: UpbitService):
        self.upbit_service = upbit_service
        self.active_strategies: Dict[str, BaseStrategy] = {}
        self.is_running = False

    def create_strategy(self, strategy_name: str, market: str, parameters: Dict) -> BaseStrategy:
        """전략 인스턴스를 생성합니다."""
        if strategy_name == 'moving_average':
            return MovingAverageStrategy(market, parameters)
        # 다른 전략들 추가 예정
        raise ValueError(f"Unknown strategy: {strategy_name}")

    async def start_trading(self, market: str, strategy_name: str, parameters: Dict):
        """특정 마켓에 대한 거래를 시작합니다."""
        if market in self.active_strategies:
            raise ValueError(f"Trading already active for {market}")

        strategy = self.create_strategy(strategy_name, market, parameters)
        self.active_strategies[market] = strategy
        self.is_running = True

        while self.is_running and market in self.active_strategies:
            try:
                # 최근 캔들 데이터 조회
                candles = await self.upbit_service.get_candles(market, '1m', 200)
                
                # 매매 신호 계산
                signal = strategy.calculate_signals(candles)
                
                # 거래 실행 여부 확인
                if strategy.should_execute_trade(signal):
                    if signal['signal'] == 'buy':
                        # 매수 주문
                        order = await self.upbit_service.create_order(
                            market=market,
                            side='bid',
                            volume=None,  # 시장가 매수
                            price=None,   # 시장가 매수
                            ord_type='price'
                        )
                        if order:
                            strategy.update_position(signal)
                    elif signal['signal'] == 'sell':
                        # 보유 수량 확인
                        balance = await self.upbit_service.get_balance(market)
                        if balance and float(balance['balance']) > 0:
                            # 매도 주문
                            order = await self.upbit_service.create_order(
                                market=market,
                                side='ask',
                                volume=balance['balance'],
                                price=None,
                                ord_type='market'
                            )
                            if order:
                                strategy.update_position(signal)

            except Exception as e:
                print(f"Error in trading loop: {e}")

            # 1분 대기
            await asyncio.sleep(60)

    def stop_trading(self, market: Optional[str] = None):
        """거래를 중지합니다."""
        if market:
            if market in self.active_strategies:
                del self.active_strategies[market]
        else:
            self.active_strategies.clear()
            self.is_running = False 