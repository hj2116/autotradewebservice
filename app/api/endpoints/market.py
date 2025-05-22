from fastapi import APIRouter, HTTPException, Query
from app.services.upbit_service import UpbitService

router = APIRouter()
upbit_service = UpbitService()

@router.get("/markets")
async def get_markets():
    """마켓 코드 목록 조회"""
    try:
        markets = upbit_service.get_market_list()
        return markets
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/price/{market_code}")
async def get_price(market_code: str):
    """현재가 조회"""
    try:
        price = upbit_service.get_current_price(market_code)
        return price
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/account")
async def get_account():
    """계좌 정보 조회"""
    try:
        account = upbit_service.get_account_info()
        return account
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/candles")
async def get_candles(
    unit: str = Query("days"),
    market_code: str = Query(...),
    count: int = Query(30, ge=1, le=200)
):
    """
    캔들 데이터 조회 (unit: days, minutes/1, minutes/60 등)
    """
    try:
        candles = upbit_service.get_candles(market_code, unit, count)
        return candles
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 