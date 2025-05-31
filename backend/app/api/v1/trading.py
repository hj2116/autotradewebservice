from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List
from ...services.trading.tradingService import TradingService
from ...services.upbit_service import UpbitService
from ...core.deps import get_upbit_service

router = APIRouter()

@router.post("/start")
async def start_trading(
    market: str,
    strategy: str,
    parameters: Dict,
    upbit_service: UpbitService = Depends(get_upbit_service)
):
    """거래를 시작합니다."""
    try:
        trading_service = TradingService(upbit_service)
        await trading_service.start_trading(market, strategy, parameters)
        return {"status": "success", "message": f"Trading started for {market}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/stop")
async def stop_trading(
    market: str,
    upbit_service: UpbitService = Depends(get_upbit_service)
):
    """거래를 중지합니다."""
    try:
        trading_service = TradingService(upbit_service)
        trading_service.stop_trading(market)
        return {"status": "success", "message": f"Trading stopped for {market}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/status")
async def get_trading_status(
    upbit_service: UpbitService = Depends(get_upbit_service)
):
    """현재 실행 중인 거래 상태를 조회합니다."""
    try:
        trading_service = TradingService(upbit_service)
        return {
            "status": "success",
            "active_markets": list(trading_service.active_strategies.keys())
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 