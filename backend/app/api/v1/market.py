from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict
from ...services.upbit_service import UpbitService
from ...core.deps import get_upbit_service

router = APIRouter()

@router.get("/daily-candles/{market}")
async def get_daily_candles(
    market: str,
    count: int = 21,
    upbit_service: UpbitService = Depends(get_upbit_service)
) -> List[Dict]:
    """
    특정 마켓의 최근 일봉 데이터를 가져옵니다.
    Args:
        market: 마켓 코드 (예: KRW-BTC)
        count: 가져올 캔들 개수 (기본값: 21)
    Returns:
        List[Dict]: 일봉 데이터 리스트
    """
    try:
        candles = await upbit_service.get_daily_candles(market, count)
        return candles
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/volatility/{market}")
async def get_volatility(
    market: str,
    window: int = 20,
    upbit_service: UpbitService = Depends(get_upbit_service)
) -> Dict:
    """
    특정 마켓의 일별 종가 데이터 기반 변동성을 계산합니다.
    Args:
        market: 마켓 코드 (예: KRW-BTC)
        window: 변동성 계산에 사용할 기간 (기본값: 20)
    Returns:
        Dict: {
            'volatility': float,  # 변동성
            'data': List[Dict]  # 사용된 데이터
        }
    """
    try:
        result = await upbit_service.calculate_volatility(market, window)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/candles")
async def get_candles(
    unit: str = Query(..., description="봉 타입 (days, minutes, etc)"),
    market_code: str = Query(..., description="마켓 코드 (예: KRW-BTC)"),
    count: int = Query(50, description="가져올 캔들 개수"),
    upbit_service: UpbitService = Depends(get_upbit_service)
):
    """
    다양한 봉 타입(일봉, 분봉 등)과 마켓코드, 개수로 캔들 데이터 조회
    """
    try:
        if unit == "days":
            candles = await upbit_service.get_daily_candles(market_code, count)
        # elif unit == "minutes":
        #     candles = await upbit_service.get_minute_candles(market_code, count)
        else:
            raise HTTPException(status_code=400, detail="지원하지 않는 unit입니다.")
        return candles
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 