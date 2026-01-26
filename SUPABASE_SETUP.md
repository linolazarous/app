# Supabase Setup Instructions for Right Tech Centre

## What is Supabase?
Supabase is an open-source Firebase alternative that provides:
- PostgreSQL Database (instead of MongoDB)
- Authentication
- Real-time subscriptions
- Storage for files and media
- Auto-generated REST APIs

## Current Setup
Right Tech Centre is currently configured with MongoDB. To migrate to Supabase, follow these instructions:

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account or log in
3. Click "New Project"
4. Fill in the details:
   - **Project Name**: Right Tech Centre
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Select closest to your users
   - **Pricing Plan**: Start with Free tier
5. Click "Create new project" and wait for setup (2-3 minutes)

---

## Step 2: Get Your Supabase Credentials

Once your project is created:

1. Go to **Project Settings** (gear icon) → **API**
2. You'll need these credentials:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (Keep this SECRET!)

3. Go to **Project Settings** → **Database**
   - **Connection String**: Copy the URI connection string

---

## Step 3: Set Up Database Schema

### Option A: Using Supabase Dashboard

1. Go to **SQL Editor** in your Supabase project
2. Create a new query
3. Run this SQL to create your tables:

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    course_type VARCHAR(50) NOT NULL,
    credit_hours INTEGER NOT NULL,
    modules_count INTEGER NOT NULL,
    duration_months INTEGER NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules table
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    credit_hours INTEGER DEFAULT 4,
    module_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    vimeo_id VARCHAR(50),
    duration_minutes INTEGER DEFAULT 0,
    lesson_order INTEGER NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessments table
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    assessment_type VARCHAR(50) NOT NULL,
    questions JSONB NOT NULL,
    passing_score INTEGER DEFAULT 70,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Progress tracking table
CREATE TABLE progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    current_time DECIMAL(10,2) DEFAULT 0,
    duration DECIMAL(10,2) DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Certificates table
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    certificate_url TEXT NOT NULL,
    UNIQUE(user_id, course_id)
);

-- AI chat history table
CREATE TABLE ai_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_modules_course_id ON modules(course_id);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_assessments_module_id ON assessments(module_id);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_progress_user_id ON progress(user_id);
CREATE INDEX idx_progress_lesson_id ON progress(lesson_id);
CREATE INDEX idx_certificates_user_id ON certificates(user_id);
CREATE INDEX idx_ai_chats_session_id ON ai_chats(session_id);
```

4. Click "Run" to execute the SQL

---

## Step 4: Enable Row Level Security (Optional but Recommended)

Run these policies to secure your data:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;

-- Allow public read access to courses
CREATE POLICY "Public courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Public modules" ON modules FOR SELECT USING (true);
CREATE POLICY "Public lessons" ON lessons FOR SELECT USING (true);

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own enrollments" ON enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own progress" ON progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own certificates" ON certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own chats" ON ai_chats FOR SELECT USING (auth.uid() = user_id);

-- Admin policies (you'll need to implement role checking)
-- For now, use service_role key for admin operations
```

---

## Step 5: Update Your Backend Configuration

### For Production (Supabase):

1. **Install Supabase Python Client**:
```bash
cd /app/backend
pip install supabase
pip freeze > requirements.txt
```

2. **Update `/app/backend/.env`**:
```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Keep these for local development
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"

# Use Supabase in production
USE_SUPABASE=true
```

3. **Database Adapter**: You would need to create a database adapter layer to switch between MongoDB (local) and Supabase (production).

---

## Step 6: Update Backend Code (For Supabase)

Create `/app/backend/supabase_client.py`:

```python
from supabase import create_client, Client
import os

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL else None

def get_supabase_client():
    if not supabase:
        raise Exception("Supabase client not initialized")
    return supabase
```

---

## Step 7: Set Up Supabase Storage (For Video Thumbnails)

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket: `course-thumbnails`
3. Set it to **Public** if you want direct access to images
4. Upload images via:
   - Dashboard UI
   - Or programmatically using Python client

---

## Step 8: Enable Authentication (Optional)

Supabase provides built-in authentication:

1. Go to **Authentication** → **Providers**
2. Enable desired providers:
   - Email/Password (enabled by default)
   - Google OAuth
   - GitHub
   - etc.

3. Configure redirect URLs for your app

---

## Step 9: Vercel Deployment Configuration

When deploying to Vercel, add these environment variables:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
USE_SUPABASE=true
```

---

## Current Implementation Note

**The application is currently running with MongoDB** for local development. To fully migrate to Supabase:

1. Follow the steps above to set up your Supabase project
2. You'll need to modify the backend code to use Supabase client instead of MongoDB
3. Update API routes to use Supabase queries
4. Test thoroughly before deploying to production

For now, the app works perfectly with MongoDB locally. Supabase migration can be done when you're ready to deploy to production.

---

## Benefits of Supabase Over MongoDB

✅ **Built-in Authentication**: No need to implement JWT manually  
✅ **Real-time Subscriptions**: Live updates without polling  
✅ **Auto-generated APIs**: REST and GraphQL endpoints  
✅ **Row Level Security**: Database-level access control  
✅ **Storage**: Built-in file/media storage  
✅ **Edge Functions**: Serverless functions at the edge  
✅ **Free Tier**: 500MB database, 1GB storage, 2GB bandwidth

---

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Python Client](https://supabase.com/docs/reference/python/introduction)
- [Supabase Discord Community](https://discord.supabase.com/)

---

**Note**: This setup guide provides instructions for Supabase integration. The current application uses MongoDB and works perfectly for local development and can be deployed as-is. Supabase migration is optional and recommended for production deployments requiring advanced features.
