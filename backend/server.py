from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, File, UploadFile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import aiohttp
import asyncio
from passlib.context import CryptContext
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "your-secret-key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))

# Vimeo settings
VIMEO_ACCESS_TOKEN = os.getenv("VIMEO_ACCESS_TOKEN", "")

# OpenAI/Emergent settings  
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY", "")

security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ===========================
# Models
# ===========================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "student"  # student, instructor, admin

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class CourseCreate(BaseModel):
    title: str
    description: str
    course_type: str  # diploma, bachelor, certification
    credit_hours: int
    modules_count: int
    duration_months: int
    thumbnail_url: Optional[str] = None

class CourseResponse(BaseModel):
    id: str
    title: str
    description: str
    course_type: str
    credit_hours: int
    modules_count: int
    duration_months: int
    thumbnail_url: Optional[str]
    created_at: datetime
    updated_at: datetime

class ModuleCreate(BaseModel):
    course_id: str
    title: str
    description: str
    credit_hours: int = 4
    module_order: int

class ModuleResponse(BaseModel):
    id: str
    course_id: str
    title: str
    description: str
    credit_hours: int
    module_order: int
    created_at: datetime

class LessonCreate(BaseModel):
    module_id: str
    title: str
    description: Optional[str] = None
    vimeo_id: Optional[str] = None
    duration_minutes: int = 0
    lesson_order: int
    content: Optional[str] = None

class LessonResponse(BaseModel):
    id: str
    module_id: str
    title: str
    description: Optional[str]
    vimeo_id: Optional[str]
    duration_minutes: int
    lesson_order: int
    content: Optional[str]
    created_at: datetime

class AssessmentCreate(BaseModel):
    module_id: str
    title: str
    assessment_type: str  # quiz, assignment, exam
    questions: List[dict]
    passing_score: int = 70

class AssessmentResponse(BaseModel):
    id: str
    module_id: str
    title: str
    assessment_type: str
    questions: List[dict]
    passing_score: int
    created_at: datetime

class EnrollmentCreate(BaseModel):
    course_id: str

class EnrollmentResponse(BaseModel):
    id: str
    user_id: str
    course_id: str
    progress_percentage: float = 0.0
    is_completed: bool = False
    enrolled_at: datetime

class ProgressUpdate(BaseModel):
    lesson_id: str
    current_time: float = 0
    duration: float = 0
    is_completed: bool = False

class CertificateResponse(BaseModel):
    id: str
    user_id: str
    course_id: str
    issued_at: datetime
    certificate_url: str

class AITutorRequest(BaseModel):
    course_id: str
    message: str
    session_id: Optional[str] = None

class AITutorResponse(BaseModel):
    message: str
    session_id: str

class VideoUploadRequest(BaseModel):
    title: str
    description: Optional[str] = None
    video_url: str
    privacy: str = "private"

class VideoMetadataResponse(BaseModel):
    vimeo_id: str
    title: str
    duration: float
    thumbnail_url: Optional[str]
    embed_html: Optional[str]

# ===========================
# Helper Functions
# ===========================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

# Vimeo Service
class VimeoService:
    def __init__(self):
        self.access_token = VIMEO_ACCESS_TOKEN
        self.base_url = "https://api.vimeo.com"
        self.headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Accept": "application/vnd.vimeo.*+json;version=3.4"
        }

    async def get_video_metadata(self, vimeo_id: str) -> dict:
        if not self.access_token:
            return {
                "vimeo_id": vimeo_id,
                "title": "Sample Video",
                "duration": 300,
                "thumbnail_url": None,
                "embed_html": f'<iframe src="https://player.vimeo.com/video/{vimeo_id}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>'
            }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(
                    f"{self.base_url}/videos/{vimeo_id}",
                    headers=self.headers,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "vimeo_id": vimeo_id,
                            "title": data.get("name", "Video"),
                            "duration": data.get("duration", 0),
                            "thumbnail_url": data.get("pictures", {}).get("sizes", [{}])[-1].get("link"),
                            "embed_html": data.get("embed", {}).get("html")
                        }
                    else:
                        raise Exception(f"Vimeo API error: {response.status}")
            except Exception as e:
                logging.error(f"Error fetching Vimeo metadata: {e}")
                return {
                    "vimeo_id": vimeo_id,
                    "title": "Video",
                    "duration": 0,
                    "thumbnail_url": None,
                    "embed_html": f'<iframe src="https://player.vimeo.com/video/{vimeo_id}" frameborder="0" allowfullscreen></iframe>'
                }

vimeo_service = VimeoService()

# ===========================
# Routes
# ===========================

# Auth Routes
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "full_name": user_data.full_name,
        "role": user_data.role,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_access_token({"sub": user_id})
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=user_data.email,
            full_name=user_data.full_name,
            role=user_data.role,
            created_at=datetime.fromisoformat(user_doc["created_at"])
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user["id"]})
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            role=user["role"],
            created_at=datetime.fromisoformat(user["created_at"])
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        role=current_user["role"],
        created_at=datetime.fromisoformat(current_user["created_at"])
    )

# Course Routes
@api_router.post("/courses", response_model=CourseResponse)
async def create_course(course: CourseCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    course_id = str(uuid.uuid4())
    course_doc = {
        "id": course_id,
        **course.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.courses.insert_one(course_doc)
    
    return CourseResponse(**course_doc, created_at=datetime.fromisoformat(course_doc["created_at"]), updated_at=datetime.fromisoformat(course_doc["updated_at"]))

@api_router.get("/courses", response_model=List[CourseResponse])
async def list_courses():
    courses = await db.courses.find({}, {"_id": 0}).to_list(1000)
    return [
        CourseResponse(
            **c,
            created_at=datetime.fromisoformat(c["created_at"]),
            updated_at=datetime.fromisoformat(c["updated_at"])
        ) for c in courses
    ]

@api_router.get("/courses/{course_id}", response_model=CourseResponse)
async def get_course(course_id: str):
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return CourseResponse(
        **course,
        created_at=datetime.fromisoformat(course["created_at"]),
        updated_at=datetime.fromisoformat(course["updated_at"])
    )

@api_router.put("/courses/{course_id}", response_model=CourseResponse)
async def update_course(course_id: str, course_update: CourseCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    update_doc = {
        **course_update.model_dump(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.courses.find_one_and_update(
        {"id": course_id},
        {"$set": update_doc},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return CourseResponse(
        **result,
        created_at=datetime.fromisoformat(result["created_at"]),
        updated_at=datetime.fromisoformat(result["updated_at"])
    )

@api_router.delete("/courses/{course_id}")
async def delete_course(course_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.courses.delete_one({"id": course_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return {"message": "Course deleted"}

# Module Routes
@api_router.post("/modules", response_model=ModuleResponse)
async def create_module(module: ModuleCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Admin or instructor access required")
    
    module_id = str(uuid.uuid4())
    module_doc = {
        "id": module_id,
        **module.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.modules.insert_one(module_doc)
    
    return ModuleResponse(**module_doc, created_at=datetime.fromisoformat(module_doc["created_at"]))

@api_router.get("/courses/{course_id}/modules", response_model=List[ModuleResponse])
async def list_course_modules(course_id: str):
    modules = await db.modules.find({"course_id": course_id}, {"_id": 0}).sort("module_order", 1).to_list(1000)
    return [
        ModuleResponse(**m, created_at=datetime.fromisoformat(m["created_at"]))
        for m in modules
    ]

@api_router.get("/modules/{module_id}", response_model=ModuleResponse)
async def get_module(module_id: str):
    module = await db.modules.find_one({"id": module_id}, {"_id": 0})
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return ModuleResponse(**module, created_at=datetime.fromisoformat(module["created_at"]))

# Lesson Routes
@api_router.post("/lessons", response_model=LessonResponse)
async def create_lesson(lesson: LessonCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Admin or instructor access required")
    
    lesson_id = str(uuid.uuid4())
    lesson_doc = {
        "id": lesson_id,
        **lesson.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.lessons.insert_one(lesson_doc)
    
    return LessonResponse(**lesson_doc, created_at=datetime.fromisoformat(lesson_doc["created_at"]))

@api_router.get("/modules/{module_id}/lessons", response_model=List[LessonResponse])
async def list_module_lessons(module_id: str):
    lessons = await db.lessons.find({"module_id": module_id}, {"_id": 0}).sort("lesson_order", 1).to_list(1000)
    return [
        LessonResponse(**l, created_at=datetime.fromisoformat(l["created_at"]))
        for l in lessons
    ]

@api_router.get("/lessons/{lesson_id}", response_model=LessonResponse)
async def get_lesson(lesson_id: str):
    lesson = await db.lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return LessonResponse(**lesson, created_at=datetime.fromisoformat(lesson["created_at"]))

# Assessment Routes
@api_router.post("/assessments", response_model=AssessmentResponse)
async def create_assessment(assessment: AssessmentCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Admin or instructor access required")
    
    assessment_id = str(uuid.uuid4())
    assessment_doc = {
        "id": assessment_id,
        **assessment.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.assessments.insert_one(assessment_doc)
    
    return AssessmentResponse(**assessment_doc, created_at=datetime.fromisoformat(assessment_doc["created_at"]))

@api_router.get("/modules/{module_id}/assessments", response_model=List[AssessmentResponse])
async def list_module_assessments(module_id: str):
    assessments = await db.assessments.find({"module_id": module_id}, {"_id": 0}).to_list(1000)
    return [
        AssessmentResponse(**a, created_at=datetime.fromisoformat(a["created_at"]))
        for a in assessments
    ]

# Enrollment Routes
@api_router.post("/enrollments", response_model=EnrollmentResponse)
async def enroll_course(enrollment: EnrollmentCreate, current_user: dict = Depends(get_current_user)):
    existing = await db.enrollments.find_one(
        {"user_id": current_user["id"], "course_id": enrollment.course_id},
        {"_id": 0}
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")
    
    enrollment_id = str(uuid.uuid4())
    enrollment_doc = {
        "id": enrollment_id,
        "user_id": current_user["id"],
        "course_id": enrollment.course_id,
        "progress_percentage": 0.0,
        "is_completed": False,
        "enrolled_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.enrollments.insert_one(enrollment_doc)
    
    return EnrollmentResponse(**enrollment_doc, enrolled_at=datetime.fromisoformat(enrollment_doc["enrolled_at"]))

@api_router.get("/enrollments/my", response_model=List[EnrollmentResponse])
async def get_my_enrollments(current_user: dict = Depends(get_current_user)):
    enrollments = await db.enrollments.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    return [
        EnrollmentResponse(**e, enrolled_at=datetime.fromisoformat(e["enrolled_at"]))
        for e in enrollments
    ]

# Progress Routes
@api_router.post("/progress")
async def update_progress(progress: ProgressUpdate, current_user: dict = Depends(get_current_user)):
    progress_doc = {
        "user_id": current_user["id"],
        "lesson_id": progress.lesson_id,
        "current_time": progress.current_time,
        "duration": progress.duration,
        "is_completed": progress.is_completed,
        "last_updated": datetime.now(timezone.utc).isoformat()
    }
    
    await db.progress.find_one_and_update(
        {"user_id": current_user["id"], "lesson_id": progress.lesson_id},
        {"$set": progress_doc},
        upsert=True
    )
    
    return {"message": "Progress updated"}

@api_router.get("/progress/lesson/{lesson_id}")
async def get_lesson_progress(lesson_id: str, current_user: dict = Depends(get_current_user)):
    progress = await db.progress.find_one(
        {"user_id": current_user["id"], "lesson_id": lesson_id},
        {"_id": 0}
    )
    return progress or {"current_time": 0, "is_completed": False}

# Certificate Routes
@api_router.get("/certificates/my", response_model=List[CertificateResponse])
async def get_my_certificates(current_user: dict = Depends(get_current_user)):
    certificates = await db.certificates.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    return [
        CertificateResponse(**c, issued_at=datetime.fromisoformat(c["issued_at"]))
        for c in certificates
    ]

@api_router.post("/certificates/generate/{course_id}", response_model=CertificateResponse)
async def generate_certificate(course_id: str, current_user: dict = Depends(get_current_user)):
    enrollment = await db.enrollments.find_one(
        {"user_id": current_user["id"], "course_id": course_id},
        {"_id": 0}
    )
    
    if not enrollment or not enrollment.get("is_completed"):
        raise HTTPException(status_code=400, detail="Course not completed")
    
    existing_cert = await db.certificates.find_one(
        {"user_id": current_user["id"], "course_id": course_id},
        {"_id": 0}
    )
    if existing_cert:
        return CertificateResponse(**existing_cert, issued_at=datetime.fromisoformat(existing_cert["issued_at"]))
    
    cert_id = str(uuid.uuid4())
    cert_doc = {
        "id": cert_id,
        "user_id": current_user["id"],
        "course_id": course_id,
        "issued_at": datetime.now(timezone.utc).isoformat(),
        "certificate_url": f"/certificates/{cert_id}.pdf"
    }
    
    await db.certificates.insert_one(cert_doc)
    
    return CertificateResponse(**cert_doc, issued_at=datetime.fromisoformat(cert_doc["issued_at"]))

# AI Tutor Routes
@api_router.post("/ai-tutor", response_model=AITutorResponse)
async def ask_ai_tutor(request: AITutorRequest, current_user: dict = Depends(get_current_user)):
    try:
        session_id = request.session_id or str(uuid.uuid4())
        
        # Get course context
        course = await db.courses.find_one({"id": request.course_id}, {"_id": 0})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Use OpenAI API key or Emergent LLM key
        api_key = OPENAI_API_KEY if OPENAI_API_KEY else EMERGENT_LLM_KEY
        
        system_message = f"You are an AI tutor for the course '{course['title']}'. Help students understand the course material, answer questions, and provide explanations. Be encouraging and educational."
        
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system_message
        )
        
        if not OPENAI_API_KEY and EMERGENT_LLM_KEY:
            chat.with_model("openai", "gpt-4o")
        else:
            chat.with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=request.message)
        response = await chat.send_message(user_message)
        
        # Store chat history
        chat_doc = {
            "id": str(uuid.uuid4()),
            "user_id": current_user["id"],
            "course_id": request.course_id,
            "session_id": session_id,
            "user_message": request.message,
            "ai_response": response,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.ai_chats.insert_one(chat_doc)
        
        return AITutorResponse(message=response, session_id=session_id)
    except Exception as e:
        logging.error(f"AI Tutor error: {e}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

# Video Routes
@api_router.get("/videos/{vimeo_id}/metadata", response_model=VideoMetadataResponse)
async def get_video_metadata(vimeo_id: str):
    try:
        metadata = await vimeo_service.get_video_metadata(vimeo_id)
        return VideoMetadataResponse(**metadata)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Analytics Routes
@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_courses = await db.courses.count_documents({})
    total_students = await db.users.count_documents({"role": "student"})
    total_enrollments = await db.enrollments.count_documents({})
    total_certificates = await db.certificates.count_documents({})
    
    return {
        "total_courses": total_courses,
        "total_students": total_students,
        "total_enrollments": total_enrollments,
        "total_certificates": total_certificates
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()