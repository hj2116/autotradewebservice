# Auto Trader Web Service

A web service for automated trading system.

## Project Structure

- `backend/`: FastAPI-based backend
- `frontend/`: Next.js-based frontend

## Backend Setup

1. Create and activate Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python backend.py
```

## Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3000
``` 