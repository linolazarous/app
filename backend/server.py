from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, BackgroundTasks, Header, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict
import uuid
import secrets
from datetime import datetime, timezone, timedelta
import bcrypt
from jose import jwt, JWTError
import httpx
import stripe
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from urllib.parse import urlencode


--------------------------------------------------


ENV + ROOT


--------------------------------------------------


ROOT_DIR = Path(file).parent
load_dotenv(ROOT_DIR / '.env')


logging.basicConfig(
level=logging.INFO,
format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(name)


--------------------------------------------------


DATABASE


--------------------------------------------------


MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")


if not MONGO_URL or not DB_NAME:
raise RuntimeError("MongoDB configuration missing in environment variables")


client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]


--------------------------------------------------


SECURITY


--------------------------------------------------


JWT_SECRET = os.environ.get('JWT_SECRET_KEY')
JWT_REFRESH_SECRET = os.environ.get('JWT_REFRESH_SECRET')


if not JWT_SECRET or not JWT_REFRESH_SECRET:
raise RuntimeError("JWT secrets must be set in production")


JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
JWT_REFRESH_EXPIRATION_DAYS = 7


security = HTTPBearer()


--------------------------------------------------


THIRD-PARTY CONFIG


--------------------------------------------------


XAI_API_KEY = os.environ.get('XAI_API_KEY', '')
XAI_BASE_URL = "https://api.x.ai/v1"
DEFAULT_XAI_MODEL = os.environ.get('DEFAULT_XAI_MODEL', 'grok-4-latest')
FAST_REASONING_MODEL = os.environ.get('FAST_REASONING_MODEL', 'grok-4-1-fast-reasoning')
FAST_NON_REASONING_MODEL = os.environ.get('FAST_NON_REASONING_MODEL', 'grok-4-1-fast-non-reasoning')


stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')


SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY', '')
EMAIL_FROM = os.environ.get('EMAIL_FROM', 'info@cursorcode.ai')


GITHUB_CLIENT_ID = os.environ.get('GITHUB_OAUTH_CLIENT_ID', '')
GITHUB_CLIENT_SECRET = os.environ.get('GITHUB_OAUTH_CLIENT_SECRET', '')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')


--------------------------------------------------


FASTAPI APP


--------------------------------------------------


app = FastAPI(title="CursorCode AI API", version="1.0.0")
api_router = APIRouter(prefix="/api")


--------------------------------------------------


CORS (safe default)


--------------------------------------------------


origins = os.environ.get('CORS_ORIGINS')


if origins:
allow_origins = origins.split(',')
else:
logger.warning("CORS_ORIGINS not set — defaulting to localhost only")
allow_origins = ["http://localhost:3000"]


app.add_middleware(
CORSMiddleware,
allow_credentials=True,
allow_origins=allow_origins,
allow_methods=[""],
allow_headers=[""],
)


--------------------------------------------------


AUTH HELPERS


--------------------------------------------------


def hash_password(password: str) -> str:
return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def create_access_token(data: dict) -> str:
payload = data.copy()
payload.update({
"exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
"type": "access"
})
return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(data: dict) -> str:
payload = data.copy()
payload.update({
"exp": datetime.now(timezone.utc) + timedelta(days=JWT_REFRESH_EXPIRATION_DAYS),
"type": "refresh"
})
return jwt.encode(payload, JWT_REFRESH_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
try:
payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
user_id = payload.get("sub")


    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})

    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")

    return user_doc

except JWTError:
    raise HTTPException(status_code=401, detail="Invalid token")



--------------------------------------------------


EMAIL


--------------------------------------------------


async def send_email(to_email: str, subject: str, html_content: str):
if not SENDGRID_API_KEY:
logger.warning("SendGrid not configured — skipping email")
return False


try:
    message = Mail(
        from_email=EMAIL_FROM,
        to_emails=to_email,
        subject=subject,
        html_content=html_content
    )

    SendGridAPIClient(SENDGRID_API_KEY).send(message)
    return True

except Exception as e:
    logger.error(f"Email failed: {e}")
    return False



--------------------------------------------------


HEALTH


--------------------------------------------------


@api_router.get("/")
async def root():
return {"message": "CursorCode AI API", "version": "1.0.0"}


@api_router.get("/health")
async def health():
return {
"status": "healthy",
"timestamp": datetime.now(timezone.utc).isoformat()
}


--------------------------------------------------


LIFECYCLE


--------------------------------------------------


@app.on_event("startup")
async def startup_event():
logger.info("✅ CursorCode backend starting...")


if stripe.api_key:
    logger.info("Stripe detected — billing enabled")
else:
    logger.warning("Stripe not configured — running in demo billing mode")



@app.on_event("shutdown")
async def shutdown_db_client():
client.close()
logger.info("MongoDB connection closed")


app.include_router(api_router)
