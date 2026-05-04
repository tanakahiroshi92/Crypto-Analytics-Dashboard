from fastapi import FastAPI, APIRouter, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
import httpx
import asyncio


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# CoinGecko API base URL
COINGECKO_BASE = "https://api.coingecko.com/api/v3"

# Cache for crypto data
crypto_cache = {}
CACHE_DURATION = 10  # 10 seconds cache for more real-time updates

async def fetch_coingecko_data(endpoint: str) -> Dict[str, Any]:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{COINGECKO_BASE}{endpoint}")
            response.raise_for_status()
            data = response.json()
            logging.info(f"CoinGecko API Response for {endpoint}: {data}")
            return data
        except Exception as e:
            logging.error(f"Error fetching from CoinGecko: {str(e)}")
            return None

@api_router.get("/crypto/markets")
async def get_crypto_markets(
    vs_currency: str = 'usd',
    per_page: int = 100,
    coin_id: Optional[str] = None,
    coin_ids: Optional[str] = None,
    days: Optional[int] = 7
):
    # Check cache first
    cache_key = f"markets_{vs_currency}_{per_page}_{coin_id}_{coin_ids}_{days}"
    if cache_key in crypto_cache and (datetime.now() - crypto_cache[cache_key]['timestamp']).seconds < CACHE_DURATION:
        return crypto_cache[cache_key]['data']
    
    # Build the endpoint URL
    endpoint = f"/coins/markets?vs_currency={vs_currency}&order=market_cap_desc&per_page={per_page}&sparkline=true"
    if coin_id:
        endpoint = f"/coins/{coin_id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true"
    elif coin_ids:
        endpoint = f"/coins/markets?vs_currency={vs_currency}&ids={coin_ids}&order=market_cap_desc&per_page={per_page}&sparkline=true"
    
    data = await fetch_coingecko_data(endpoint)
    
    if data:
        # If it's a single coin, wrap it in a list
        if coin_id:
            data = [data]
        
        crypto_cache[cache_key] = {
            'data': data,
            'timestamp': datetime.now()
        }
        return data
    return []

@api_router.get("/crypto/global")
async def get_global_data():
    if 'global' in crypto_cache and (datetime.now() - crypto_cache['global']['timestamp']).seconds < CACHE_DURATION:
        return crypto_cache['global']['data']
    
    data = await fetch_coingecko_data("/global")
    print("RAW COINGECKO DATA:", data)  # Debug print
    
    if data and isinstance(data, dict):
        # Extract the data from the correct structure
        response_data = {
            "data": {
                "active_cryptocurrencies": data.get("active_cryptocurrencies", 0),
                "total_market_cap": {
                    "usd": data.get("total_market_cap", {}).get("usd", 0)
                },
                "total_volume": {
                    "usd": data.get("total_volume", {}).get("usd", 0)
                },
                "market_cap_percentage": {
                    "btc": data.get("market_cap_percentage", {}).get("btc", 0)
                },
                "market_cap_change_percentage_24h_usd": data.get("market_cap_change_percentage_24h_usd", 0)
            }
        }
        
        crypto_cache['global'] = {
            'data': response_data,
            'timestamp': datetime.now()
        }
        return response_data
    return {"data": {}}

@api_router.get("/crypto/trending")
async def get_trending():
    if 'trending' in crypto_cache and (datetime.now() - crypto_cache['trending']['timestamp']).seconds < CACHE_DURATION:
        return crypto_cache['trending']['data']
    
    data = await fetch_coingecko_data("/search/trending")
    
    if data:
        crypto_cache['trending'] = {
            'data': data,
            'timestamp': datetime.now()
        }
        return data
    return {}

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

# Get CORS origins from environment variable or use default
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'https://crypto-analytics-frontend.onrender.com').split(',')

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
