from app.core.config import settings
from app.services.upbit_service import UpbitService

def get_upbit_service():
    return UpbitService(settings.UPBIT_ACCESS_KEY, settings.UPBIT_SECRET_KEY) 