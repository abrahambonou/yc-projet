from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv
import openai
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
import uuid
import json
from google.auth.transport import requests
from google.oauth2 import id_token
import httpx

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Educational Platform API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
db = client.education_platform

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY")

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    learning_preferences: Optional[Dict[str, Any]] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    token: str

class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    learning_preferences: Optional[Dict[str, Any]] = None
    progress: Optional[Dict[str, Any]] = None
    badges: List[str] = []
    created_at: datetime
    last_login: Optional[datetime] = None

class LearningPath(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str
    modules: List[Dict[str, Any]]
    estimated_duration: int
    prerequisites: List[str] = []

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int
    explanation: str

class Assessment(BaseModel):
    id: str
    title: str
    questions: List[QuizQuestion]
    passing_score: int
    time_limit: Optional[int] = None

class ChatMessage(BaseModel):
    message: str
    context: Optional[str] = None

class ForumPost(BaseModel):
    title: str
    content: str
    category: str

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise credentials_exception
    return user

# API Routes
@app.get("/")
async def root():
    return {"message": "Educational Platform API", "version": "1.0.0"}

@app.post("/api/auth/register")
async def register(user: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    
    user_doc = {
        "id": user_id,
        "email": user.email,
        "full_name": user.full_name,
        "password": hashed_password,
        "learning_preferences": user.learning_preferences or {},
        "progress": {"completed_modules": [], "current_level": "beginner", "total_points": 0},
        "badges": [],
        "created_at": datetime.utcnow(),
        "last_login": None,
        "is_active": True
    }
    
    await db.users.insert_one(user_doc)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": user.email,
            "full_name": user.full_name,
            "learning_preferences": user.learning_preferences or {}
        }
    }

@app.post("/api/auth/login")
async def login(user: UserLogin):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    await db.users.update_one(
        {"id": db_user["id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user["id"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user["id"],
            "email": db_user["email"],
            "full_name": db_user["full_name"],
            "learning_preferences": db_user.get("learning_preferences", {})
        }
    }

@app.post("/api/auth/google")
async def google_auth(auth_request: GoogleAuthRequest):
    try:
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(
            auth_request.token, 
            requests.Request(), 
            os.getenv("GOOGLE_CLIENT_ID")
        )
        
        # Extract user info
        email = idinfo.get("email")
        name = idinfo.get("name")
        
        if not email:
            raise HTTPException(status_code=400, detail="Invalid Google token")
        
        # Check if user exists
        db_user = await db.users.find_one({"email": email})
        
        if not db_user:
            # Create new user
            user_id = str(uuid.uuid4())
            user_doc = {
                "id": user_id,
                "email": email,
                "full_name": name,
                "password": None,  # Google auth users don't have passwords
                "learning_preferences": {},
                "progress": {"completed_modules": [], "current_level": "beginner", "total_points": 0},
                "badges": [],
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow(),
                "is_active": True,
                "auth_provider": "google"
            }
            await db.users.insert_one(user_doc)
            db_user = user_doc
        else:
            # Update last login
            await db.users.update_one(
                {"id": db_user["id"]},
                {"$set": {"last_login": datetime.utcnow()}}
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": db_user["id"]}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": db_user["id"],
                "email": db_user["email"],
                "full_name": db_user["full_name"],
                "learning_preferences": db_user.get("learning_preferences", {})
            }
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google token")

@app.get("/api/user/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "full_name": current_user["full_name"],
        "learning_preferences": current_user.get("learning_preferences", {}),
        "progress": current_user.get("progress", {}),
        "badges": current_user.get("badges", []),
        "created_at": current_user["created_at"],
        "last_login": current_user.get("last_login")
    }

@app.post("/api/learning/generate-path")
async def generate_learning_path(
    preferences: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    try:
        # Use OpenAI to generate personalized learning path
        prompt = f"""
        Create a personalized learning path for a user with these preferences:
        {json.dumps(preferences, indent=2)}
        
        Current user level: {current_user.get('progress', {}).get('current_level', 'beginner')}
        
        Generate a structured learning path with:
        1. Path title and description
        2. Difficulty level
        3. 5-7 modules with titles, descriptions, and estimated duration
        4. Prerequisites if any
        
        Return as JSON format.
        """
        
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert educational content creator. Create comprehensive, engaging learning paths."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000,
            temperature=0.7
        )
        
        path_data = json.loads(response.choices[0].message.content)
        
        # Save learning path to database
        path_id = str(uuid.uuid4())
        path_doc = {
            "id": path_id,
            "user_id": current_user["id"],
            "title": path_data.get("title", "Personalized Learning Path"),
            "description": path_data.get("description", ""),
            "difficulty": path_data.get("difficulty", "intermediate"),
            "modules": path_data.get("modules", []),
            "estimated_duration": path_data.get("estimated_duration", 0),
            "prerequisites": path_data.get("prerequisites", []),
            "created_at": datetime.utcnow(),
            "is_active": True
        }
        
        await db.learning_paths.insert_one(path_doc)
        
        return path_doc
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating learning path: {str(e)}")

@app.get("/api/learning/paths")
async def get_learning_paths(current_user: dict = Depends(get_current_user)):
    paths = await db.learning_paths.find({"user_id": current_user["id"]}).to_list(100)
    return paths

@app.post("/api/assessment/generate-quiz")
async def generate_quiz(
    topic: str,
    difficulty: str = "intermediate",
    num_questions: int = 5,
    current_user: dict = Depends(get_current_user)
):
    try:
        prompt = f"""
        Create a {difficulty} level quiz about {topic} with {num_questions} multiple choice questions.
        
        For each question, provide:
        1. The question text
        2. 4 multiple choice options
        3. The correct answer index (0-3)
        4. A brief explanation of why the answer is correct
        
        Return as JSON format with questions array.
        """
        
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert quiz creator. Create engaging, educational quiz questions."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000,
            temperature=0.7
        )
        
        quiz_data = json.loads(response.choices[0].message.content)
        
        # Save quiz to database
        quiz_id = str(uuid.uuid4())
        quiz_doc = {
            "id": quiz_id,
            "user_id": current_user["id"],
            "topic": topic,
            "difficulty": difficulty,
            "questions": quiz_data.get("questions", []),
            "passing_score": 70,
            "created_at": datetime.utcnow(),
            "is_active": True
        }
        
        await db.quizzes.insert_one(quiz_doc)
        
        return quiz_doc
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}")

@app.post("/api/chat/mentor")
async def chat_with_mentor(
    message: ChatMessage,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Get user context
        user_progress = current_user.get("progress", {})
        user_preferences = current_user.get("learning_preferences", {})
        
        system_prompt = f"""
        You are an AI educational mentor. Help users with their learning journey.
        
        User context:
        - Current level: {user_progress.get('current_level', 'beginner')}
        - Completed modules: {len(user_progress.get('completed_modules', []))}
        - Total points: {user_progress.get('total_points', 0)}
        - Learning preferences: {json.dumps(user_preferences)}
        
        Provide helpful, encouraging, and personalized educational guidance.
        """
        
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message.message}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        # Save chat to database
        chat_doc = {
            "id": str(uuid.uuid4()),
            "user_id": current_user["id"],
            "message": message.message,
            "response": response.choices[0].message.content,
            "context": message.context,
            "created_at": datetime.utcnow()
        }
        
        await db.chats.insert_one(chat_doc)
        
        return {
            "response": response.choices[0].message.content,
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error with mentor chat: {str(e)}")

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    # Get user's progress data
    user_progress = current_user.get("progress", {})
    
    # Calculate various metrics
    total_modules = await db.learning_paths.count_documents({"user_id": current_user["id"]})
    completed_modules = len(user_progress.get("completed_modules", []))
    completion_rate = (completed_modules / total_modules * 100) if total_modules > 0 else 0
    
    # Get recent activities
    recent_chats = await db.chats.find({"user_id": current_user["id"]}).sort("created_at", -1).limit(5).to_list(5)
    recent_quizzes = await db.quizzes.find({"user_id": current_user["id"]}).sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "user_stats": {
            "total_points": user_progress.get("total_points", 0),
            "current_level": user_progress.get("current_level", "beginner"),
            "badges": current_user.get("badges", []),
            "completion_rate": completion_rate,
            "total_modules": total_modules,
            "completed_modules": completed_modules
        },
        "recent_activities": {
            "chats": recent_chats,
            "quizzes": recent_quizzes
        }
    }

@app.post("/api/forum/posts")
async def create_forum_post(
    post: ForumPost,
    current_user: dict = Depends(get_current_user)
):
    post_id = str(uuid.uuid4())
    post_doc = {
        "id": post_id,
        "user_id": current_user["id"],
        "author_name": current_user["full_name"],
        "title": post.title,
        "content": post.content,
        "category": post.category,
        "likes": 0,
        "replies": [],
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    await db.forum_posts.insert_one(post_doc)
    return post_doc

@app.get("/api/forum/posts")
async def get_forum_posts(category: Optional[str] = None, limit: int = 20):
    filter_dict = {"is_active": True}
    if category:
        filter_dict["category"] = category
    
    posts = await db.forum_posts.find(filter_dict).sort("created_at", -1).limit(limit).to_list(limit)
    return posts

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)