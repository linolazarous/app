from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, BackgroundTasks, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
from jose import jwt, JWTError
import httpx
import stripe
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Configuration
JWT_SECRET = os.environ.get('JWT_SECRET_KEY', 'cursorcode-secret-key-change-in-production')
JWT_REFRESH_SECRET = os.environ.get('JWT_REFRESH_SECRET', 'cursorcode-refresh-secret-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
JWT_REFRESH_EXPIRATION_DAYS = 7

# xAI Configuration
XAI_API_KEY = os.environ.get('XAI_API_KEY', '')
XAI_BASE_URL = "https://api.x.ai/v1"
DEFAULT_XAI_MODEL = os.environ.get('DEFAULT_XAI_MODEL', 'grok-4-latest')
FAST_REASONING_MODEL = os.environ.get('FAST_REASONING_MODEL', 'grok-4-1-fast-reasoning')
FAST_NON_REASONING_MODEL = os.environ.get('FAST_NON_REASONING_MODEL', 'grok-4-1-fast-non-reasoning')

# Stripe Configuration
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')

# SendGrid Configuration
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY', '')
EMAIL_FROM = os.environ.get('EMAIL_FROM', 'info@cursorcode.ai')

# Create the main app
app = FastAPI(title="CursorCode AI API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    password_hash: str
    plan: str = "starter"
    credits: int = 10
    credits_used: int = 0
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    plan: str
    credits: int
    credits_used: int
    is_admin: bool
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    prompt: Optional[str] = ""

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    description: str = ""
    prompt: str = ""
    status: str = "draft"
    files: Dict[str, str] = Field(default_factory=dict)
    tech_stack: List[str] = Field(default_factory=list)
    deployed_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProjectResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: str
    prompt: str
    status: str
    files: Dict[str, str]
    tech_stack: List[str]
    deployed_url: Optional[str]
    created_at: str
    updated_at: str

class AIGenerateRequest(BaseModel):
    project_id: str
    prompt: str
    model: Optional[str] = None
    task_type: str = "code_generation"

class AIGenerateResponse(BaseModel):
    id: str
    project_id: str
    prompt: str
    response: str
    model_used: str
    credits_used: int
    created_at: str

class CreditUsage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    project_id: Optional[str] = None
    model: str
    credits_used: int
    task_type: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SubscriptionPlan(BaseModel):
    name: str
    price: int
    credits: int
    features: List[str]
    stripe_price_id: Optional[str] = None

# Subscription Plans
SUBSCRIPTION_PLANS = {
    "starter": SubscriptionPlan(
        name="Starter",
        price=0,
        credits=10,
        features=["10 AI credits/month", "1 project", "Subdomain deploy", "Community support"]
    ),
    "standard": SubscriptionPlan(
        name="Standard",
        price=29,
        credits=75,
        features=["75 AI credits/month", "Full-stack & APIs", "Native + external deploy", "Version history", "Email support"],
        stripe_price_id=os.environ.get('STRIPE_STANDARD_PRICE_ID')
    ),
    "pro": SubscriptionPlan(
        name="Pro",
        price=59,
        credits=150,
        features=["150 AI credits/month", "SaaS & multi-tenant", "Advanced agents", "CI/CD integration", "Priority builds"],
        stripe_price_id=os.environ.get('STRIPE_PRO_PRICE_ID')
    ),
    "premier": SubscriptionPlan(
        name="Premier",
        price=199,
        credits=600,
        features=["600 AI credits/month", "Large SaaS", "Multi-org support", "Advanced security scans", "Priority support"],
        stripe_price_id=os.environ.get('STRIPE_PREMIER_PRICE_ID')
    ),
    "ultra": SubscriptionPlan(
        name="Ultra",
        price=499,
        credits=2000,
        features=["2,000 AI credits/month", "Unlimited projects", "Dedicated compute", "SLA guarantee", "Enterprise support"],
        stripe_price_id=os.environ.get('STRIPE_ULTRA_PRICE_ID')
    )
}

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=JWT_REFRESH_EXPIRATION_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, JWT_REFRESH_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user_doc is None:
            raise HTTPException(status_code=401, detail="User not found")
        if isinstance(user_doc.get('created_at'), str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
        return User(**user_doc)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        plan=user.plan,
        credits=user.credits,
        credits_used=user.credits_used,
        is_admin=user.is_admin,
        created_at=user.created_at.isoformat() if isinstance(user.created_at, datetime) else user.created_at
    )

def project_to_response(project: Project) -> ProjectResponse:
    return ProjectResponse(
        id=project.id,
        user_id=project.user_id,
        name=project.name,
        description=project.description,
        prompt=project.prompt,
        status=project.status,
        files=project.files,
        tech_stack=project.tech_stack,
        deployed_url=project.deployed_url,
        created_at=project.created_at.isoformat() if isinstance(project.created_at, datetime) else project.created_at,
        updated_at=project.updated_at.isoformat() if isinstance(project.updated_at, datetime) else project.updated_at
    )

# ==================== EMAIL HELPERS ====================

async def send_email(to_email: str, subject: str, html_content: str):
    if not SENDGRID_API_KEY:
        logger.warning("SendGrid API key not configured, skipping email")
        return
    try:
        message = Mail(
            from_email=EMAIL_FROM,
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        sg.send(message)
        logger.info(f"Email sent to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send email: {e}")

# ==================== AI HELPERS ====================

def select_model(task_type: str) -> str:
    """Intelligent model routing based on task type"""
    routing = {
        "architecture": DEFAULT_XAI_MODEL,
        "code_generation": FAST_REASONING_MODEL,
        "code_review": FAST_REASONING_MODEL,
        "documentation": FAST_NON_REASONING_MODEL,
        "simple_query": FAST_NON_REASONING_MODEL,
        "complex_reasoning": DEFAULT_XAI_MODEL,
    }
    return routing.get(task_type, FAST_REASONING_MODEL)

def calculate_credits(model: str, task_type: str) -> int:
    """Calculate credits based on model and task complexity"""
    base_credits = {
        DEFAULT_XAI_MODEL: 3,
        FAST_REASONING_MODEL: 2,
        FAST_NON_REASONING_MODEL: 1,
    }
    return base_credits.get(model, 2)

async def call_xai_api(prompt: str, model: str, system_message: str = None) -> str:
    """Call xAI API for code generation"""
    if not XAI_API_KEY:
        # Demo mode - return mock response
        return f"""// Generated by CursorCode AI using {model}
// This is a demo response - configure XAI_API_KEY for real generation

import React from 'react';

export default function GeneratedComponent() {{
  return (
    <div className="p-6 bg-gray-900 rounded-lg">
      <h1 className="text-2xl font-bold text-white">
        AI Generated Component
      </h1>
      <p className="text-gray-400 mt-2">
        Prompt: {prompt[:100]}...
      </p>
    </div>
  );
}}"""
    
    headers = {
        "Authorization": f"Bearer {XAI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    messages = []
    if system_message:
        messages.append({"role": "system", "content": system_message})
    messages.append({"role": "user", "content": prompt})
    
    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": 4096,
        "temperature": 0.7
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{XAI_BASE_URL}/chat/completions",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/signup", response_model=TokenResponse)
async def signup(user_data: UserCreate, background_tasks: BackgroundTasks):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=hash_password(user_data.password)
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    # Send welcome email
    background_tasks.add_task(
        send_email,
        user.email,
        "Welcome to CursorCode AI!",
        f"""
        <h1>Welcome to CursorCode AI, {user.name}!</h1>
        <p>You're now part of the future of autonomous software development.</p>
        <p>Your starter plan includes 10 AI credits to get you building immediately.</p>
        <p>Build Anything. Automatically. With AI.</p>
        """
    )
    
    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_to_response(user)
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**user_doc)
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_to_response(user)
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return user_to_response(user)

@api_router.post("/auth/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str = Header(...)):
    try:
        payload = jwt.decode(refresh_token, JWT_REFRESH_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload.get("sub")
        user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user_doc:
            raise HTTPException(status_code=401, detail="User not found")
        if isinstance(user_doc.get('created_at'), str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
        user = User(**user_doc)
        new_access_token = create_access_token({"sub": user.id})
        new_refresh_token = create_refresh_token({"sub": user.id})
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            user=user_to_response(user)
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== PROJECT ROUTES ====================

@api_router.post("/projects", response_model=ProjectResponse)
async def create_project(project_data: ProjectCreate, user: User = Depends(get_current_user)):
    project = Project(
        user_id=user.id,
        name=project_data.name,
        description=project_data.description or "",
        prompt=project_data.prompt or ""
    )
    
    doc = project.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.projects.insert_one(doc)
    
    return project_to_response(project)

@api_router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(user: User = Depends(get_current_user)):
    projects = await db.projects.find({"user_id": user.id}, {"_id": 0}).to_list(100)
    result = []
    for p in projects:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
        if isinstance(p.get('updated_at'), str):
            p['updated_at'] = datetime.fromisoformat(p['updated_at'])
        result.append(project_to_response(Project(**p)))
    return result

@api_router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, user: User = Depends(get_current_user)):
    project_doc = await db.projects.find_one({"id": project_id, "user_id": user.id}, {"_id": 0})
    if not project_doc:
        raise HTTPException(status_code=404, detail="Project not found")
    if isinstance(project_doc.get('created_at'), str):
        project_doc['created_at'] = datetime.fromisoformat(project_doc['created_at'])
    if isinstance(project_doc.get('updated_at'), str):
        project_doc['updated_at'] = datetime.fromisoformat(project_doc['updated_at'])
    return project_to_response(Project(**project_doc))

@api_router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, project_data: ProjectCreate, user: User = Depends(get_current_user)):
    project_doc = await db.projects.find_one({"id": project_id, "user_id": user.id}, {"_id": 0})
    if not project_doc:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = {
        "name": project_data.name,
        "description": project_data.description or "",
        "prompt": project_data.prompt or "",
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.projects.update_one({"id": project_id}, {"$set": update_data})
    
    updated_doc = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if isinstance(updated_doc.get('created_at'), str):
        updated_doc['created_at'] = datetime.fromisoformat(updated_doc['created_at'])
    if isinstance(updated_doc.get('updated_at'), str):
        updated_doc['updated_at'] = datetime.fromisoformat(updated_doc['updated_at'])
    return project_to_response(Project(**updated_doc))

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, user: User = Depends(get_current_user)):
    result = await db.projects.delete_one({"id": project_id, "user_id": user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted"}

@api_router.put("/projects/{project_id}/files")
async def update_project_files(project_id: str, files: Dict[str, str], user: User = Depends(get_current_user)):
    project_doc = await db.projects.find_one({"id": project_id, "user_id": user.id}, {"_id": 0})
    if not project_doc:
        raise HTTPException(status_code=404, detail="Project not found")
    
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {"files": files, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Files updated"}

# ==================== AI GENERATION ROUTES ====================

@api_router.post("/ai/generate", response_model=AIGenerateResponse)
async def generate_code(request: AIGenerateRequest, user: User = Depends(get_current_user)):
    # Check credits
    model = request.model or select_model(request.task_type)
    credits_needed = calculate_credits(model, request.task_type)
    
    remaining_credits = user.credits - user.credits_used
    if remaining_credits < credits_needed:
        raise HTTPException(status_code=402, detail="Insufficient credits")
    
    # Verify project belongs to user
    project_doc = await db.projects.find_one({"id": request.project_id, "user_id": user.id}, {"_id": 0})
    if not project_doc:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Generate code
    system_message = """You are CursorCode AI, an elite autonomous AI software engineering system. 
    Generate clean, production-ready, well-documented code. 
    Include proper error handling, TypeScript types when applicable, and follow best practices."""
    
    try:
        response = await call_xai_api(request.prompt, model, system_message)
    except Exception as e:
        logger.error(f"AI generation failed: {e}")
        raise HTTPException(status_code=500, detail="AI generation failed")
    
    # Update user credits
    await db.users.update_one(
        {"id": user.id},
        {"$inc": {"credits_used": credits_needed}}
    )
    
    # Log usage
    usage = CreditUsage(
        user_id=user.id,
        project_id=request.project_id,
        model=model,
        credits_used=credits_needed,
        task_type=request.task_type
    )
    usage_doc = usage.model_dump()
    usage_doc['created_at'] = usage_doc['created_at'].isoformat()
    await db.credit_usage.insert_one(usage_doc)
    
    generation_id = str(uuid.uuid4())
    return AIGenerateResponse(
        id=generation_id,
        project_id=request.project_id,
        prompt=request.prompt,
        response=response,
        model_used=model,
        credits_used=credits_needed,
        created_at=datetime.now(timezone.utc).isoformat()
    )

@api_router.get("/ai/models")
async def get_ai_models():
    return {
        "models": [
            {
                "id": DEFAULT_XAI_MODEL,
                "name": "Grok 4 (Frontier)",
                "description": "Deep reasoning for architecture and complex tasks",
                "credits_per_use": 3
            },
            {
                "id": FAST_REASONING_MODEL,
                "name": "Grok 4 Fast Reasoning",
                "description": "Optimized for agentic workflows and tool-calling",
                "credits_per_use": 2
            },
            {
                "id": FAST_NON_REASONING_MODEL,
                "name": "Grok 4 Fast",
                "description": "High-throughput generation for simple tasks",
                "credits_per_use": 1
            }
        ]
    }

# ==================== SUBSCRIPTION ROUTES ====================

@api_router.get("/plans")
async def get_plans():
    return {"plans": {k: v.model_dump() for k, v in SUBSCRIPTION_PLANS.items()}}

@api_router.post("/subscriptions/create-checkout")
async def create_checkout_session(plan: str, user: User = Depends(get_current_user)):
    if plan not in SUBSCRIPTION_PLANS or plan == "starter":
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    plan_data = SUBSCRIPTION_PLANS[plan]
    
    if not stripe.api_key or not plan_data.stripe_price_id:
        # Demo mode
        return {"url": f"/dashboard?plan={plan}&demo=true", "demo": True}
    
    try:
        # Create or get Stripe customer
        if not user.stripe_customer_id:
            customer = stripe.Customer.create(
                email=user.email,
                name=user.name,
                metadata={"user_id": user.id}
            )
            await db.users.update_one(
                {"id": user.id},
                {"$set": {"stripe_customer_id": customer.id}}
            )
            customer_id = customer.id
        else:
            customer_id = user.stripe_customer_id
        
        # Create checkout session
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{"price": plan_data.stripe_price_id, "quantity": 1}],
            mode="subscription",
            success_url=f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/dashboard?success=true",
            cancel_url=f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/pricing?canceled=true",
            metadata={"user_id": user.id, "plan": plan}
        )
        
        return {"url": session.url}
    except Exception as e:
        logger.error(f"Stripe checkout failed: {e}")
        raise HTTPException(status_code=500, detail="Payment processing failed")

@api_router.post("/subscriptions/webhook")
async def stripe_webhook(request: Any):
    # In production, verify webhook signature
    # For demo, just log
    logger.info("Stripe webhook received")
    return {"received": True}

@api_router.get("/subscriptions/current")
async def get_current_subscription(user: User = Depends(get_current_user)):
    plan = SUBSCRIPTION_PLANS.get(user.plan, SUBSCRIPTION_PLANS["starter"])
    return {
        "plan": user.plan,
        "plan_details": plan.model_dump(),
        "credits": user.credits,
        "credits_used": user.credits_used,
        "credits_remaining": user.credits - user.credits_used
    }

# ==================== DEPLOYMENT ROUTES ====================

@api_router.post("/deploy/{project_id}")
async def deploy_project(project_id: str, user: User = Depends(get_current_user)):
    project_doc = await db.projects.find_one({"id": project_id, "user_id": user.id}, {"_id": 0})
    if not project_doc:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Generate deployment URL
    subdomain = f"{project_doc['name'].lower().replace(' ', '-')}-{project_id[:8]}"
    deployed_url = f"https://{subdomain}.cursorcode.app"
    
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {"status": "deployed", "deployed_url": deployed_url, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"deployed_url": deployed_url, "status": "deployed"}

# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/stats")
async def get_admin_stats(user: User = Depends(get_admin_user)):
    total_users = await db.users.count_documents({})
    total_projects = await db.projects.count_documents({})
    total_generations = await db.credit_usage.count_documents({})
    
    # Get plan distribution
    plan_distribution = {}
    for plan in SUBSCRIPTION_PLANS.keys():
        count = await db.users.count_documents({"plan": plan})
        plan_distribution[plan] = count
    
    # Calculate revenue (simplified)
    revenue = sum(
        SUBSCRIPTION_PLANS[plan].price * count 
        for plan, count in plan_distribution.items()
    )
    
    return {
        "total_users": total_users,
        "total_projects": total_projects,
        "total_generations": total_generations,
        "plan_distribution": plan_distribution,
        "monthly_revenue": revenue
    }

@api_router.get("/admin/users")
async def get_admin_users(user: User = Depends(get_admin_user), limit: int = 50, skip: int = 0):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).skip(skip).limit(limit).to_list(limit)
    return {"users": users, "total": await db.users.count_documents({})}

@api_router.get("/admin/usage")
async def get_admin_usage(user: User = Depends(get_admin_user), days: int = 30):
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    usage = await db.credit_usage.find(
        {"created_at": {"$gte": start_date.isoformat()}},
        {"_id": 0}
    ).to_list(1000)
    return {"usage": usage}

# ==================== HEALTH & ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "CursorCode AI API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
