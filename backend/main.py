from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import trading, market
from app.core.config import settings
from app.services.trading.inverseVolatility import InverseVolatilityStrategy
from app.services.trading.trendFollowing import TrendFollowingStrategy
from app.services.upbit_service import UpbitService


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js 프론트엔드 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(trading.router, prefix=f"{settings.API_V1_STR}/trading", tags=["trading"])
app.include_router(market.router, prefix=f"{settings.API_V1_STR}/market", tags=["market"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Auto Trader API",
        "version": settings.VERSION
    }

@app.get("/api/v1/trading/{strategy}")
async def trading(strategy: str):
    if strategy == "Inverse Volatility":
        return {"message": "InverseVolatility"}
    elif strategy == "Trend":
        return {"message": "Trend"}
    elif strategy == "CounterTrend":
        return {"message": "CounterTrend"}
    elif strategy == "Spread":
        return {"message": "Spread"}
    else:
        return {"message": "Invalid strategy"}

@app.post("/api/v1/trading/execute")
async def trading_execute(request: Request):
    body = await request.json()
    strategy = body.get("strategy")
    options = body.get("options", {})
    
    if strategy == "Inverse Volatility":
        print(options)
        upbit_service = UpbitService(settings.UPBIT_ACCESS_KEY, settings.UPBIT_SECRET_KEY)
        strat = InverseVolatilityStrategy(upbit_service, options)
        weights = await strat.calculate_portfolio_weights()
        return {"weights": weights}
    elif strategy == "Trend":
        upbit_service = UpbitService(settings.UPBIT_ACCESS_KEY, settings.UPBIT_SECRET_KEY)
        strat = TrendFollowingStrategy(upbit_service, options)
        signals = await strat.calculate_signals()
        return {"signals": signals}
    elif strategy == "CounterTrend":
        return {"message": "CounterTrend 전략 처리 예정"}
    elif strategy == "Spread":
        return {"message": "Spread 전략 처리 예정"}
    else:
        return {"error": "지원하지 않는 전략입니다."}

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 
