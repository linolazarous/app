# Right Tech Centre - AI-Powered Learning Platform

![Right Tech Centre Logo](https://customer-assets.emergentagent.com/job_8ff41f05-92b1-4c8a-95d9-187ebdd2d158/artifacts/umfriwpy_logo.webp)

**AI-Powered Tech Education Platform** - Master cutting-edge technologies with world-class certification programs.

---

## 🎯 Project Overview

Right Tech Centre is a comprehensive Learning Management System (LMS) featuring:
- ✨ AI-Powered tutoring with OpenAI integration
- 📚 Structured programs (Diploma, Bachelor, Certification)
- 🎓 Credit hour system (4 credits per module)
- 🎥 Vimeo video integration
- 🏆 Automated certificate generation
- 📊 Real-time progress tracking

---

## 🏗️ Tech Stack

### Frontend
- React 19 + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- React Router + Zustand
- Deployed on: **Vercel**

### Backend
- FastAPI (Python)
- MongoDB with Motor (async)
- JWT Authentication
- OpenAI + Vimeo APIs

### Database
- **Current**: MongoDB (local development)
- **Production**: MongoDB Atlas or Supabase

---

## 🚀 Quick Start

### 1. Backend
```bash
cd /app/backend
pip install -r requirements.txt
# Add API keys to .env
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### 2. Frontend
```bash
cd /app/frontend
yarn install
yarn start
```

### 3. Access
- Frontend: http://localhost:3000
- Backend: http://localhost:8001
- API Docs: http://localhost:8001/docs

---

## 📋 Course Structure

| Program Type | Modules | Credit Hours | Duration |
|-------------|---------|--------------|----------|
| Diploma | 15 | 60 | 12-18 months |
| Bachelor | 30 | 120 | 24 months |
| Certification | 5 | 20 | 6 months |

Each module = 4 credit hours (video lectures, quizzes, assignments, AI tutor)

---

## 👥 User Roles & Features

### Student
- Enroll in courses
- Watch video lectures (Vimeo)
- Complete assessments
- Chat with AI tutor
- Track progress
- Earn certificates

### Admin
- **3-Step Course Creation Wizard**:
  1. Course Details (type, title, description)
  2. Module Builder (create 4-credit modules)
  3. Review & Publish
- Manage all courses and students
- Generate certificates
- View analytics

### Instructor
- View course performance
- Grade assignments
- Track student progress

---

## 🎨 Design System

### Colors
- Primary: Yellow → Green gradient (#FFD700 → #7FFF00)
- Background: Black (#000)
- Text: White/Gray

### Typography
- Headings: Manrope (bold)
- Body: Inter

### UI Principles
- Dark theme with glass-morphism
- Modern, minimal, tech-focused
- Smooth animations and hover effects
- Mobile-responsive

---

## 🔑 Environment Variables

### Backend (.env)
```env
# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=right_tech_centre

# AI Tutor (choose one)
OPENAI_API_KEY=your-key
# OR
EMERGENT_LLM_KEY=sk-emergent-xxxxx

# Video Hosting
VIMEO_ACCESS_TOKEN=your-token
VIMEO_CLIENT_ID=your-id
VIMEO_CLIENT_SECRET=your-secret

# JWT
JWT_SECRET_KEY=your-secret
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 📚 Key API Endpoints

### Authentication
- POST `/api/auth/register` - Register
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Current user

### Courses
- GET `/api/courses` - List courses
- POST `/api/courses` - Create course (Admin)
- GET `/api/courses/{id}` - Course details
- GET `/api/courses/{id}/modules` - Course modules

### Learning
- POST `/api/enrollments` - Enroll
- POST `/api/progress` - Update progress
- POST `/api/ai-tutor` - Ask AI

### Certificates
- GET `/api/certificates/my` - My certificates
- POST `/api/certificates/generate/{id}` - Generate

Full docs: http://localhost:8001/docs

---

## 📱 Routes

### Public
- `/` - Landing (with hero video)
- `/about` - About page
- `/programs` - Programs overview
- `/catalog` - Course catalog
- `/course/:id` - Course details
- `/auth` - Login/Register

### Protected
- `/dashboard` - Student dashboard
- `/admin` - Admin panel
- `/instructor` - Instructor panel
- `/learn/:id` - Learning interface

---

## 🎥 Integrations

### OpenAI (AI Tutor)
- GPT-4o for course assistance
- Context-aware responses
- Multi-turn conversations
- Or use Emergent LLM Key

### Vimeo (Video Hosting)
- Video uploads
- Custom player
- Progress tracking
- Privacy controls

See `SUPABASE_SETUP.md` for Supabase migration guide.

---

## 🚀 Deployment

### Vercel (Frontend)
1. Connect GitHub repo
2. Build: `yarn build`
3. Add env vars
4. Deploy

### Backend
- Render / Railway / AWS
- Use MongoDB Atlas for database
- Set environment variables

---

## 📦 Project Structure

```
/app/
├── backend/
│   ├── server.py          # FastAPI main
│   ├── requirements.txt   # Dependencies
│   └── .env              # Config
├── frontend/
│   ├── src/
│   │   ├── pages/        # Route pages
│   │   ├── components/   # Reusable components
│   │   ├── context/      # Auth context
│   │   └── lib/          # API client
│   ├── public/           # Static files
│   └── package.json      # Dependencies
├── SUPABASE_SETUP.md     # Supabase guide
└── PROJECT_README.md     # This file
```

---

## 🎓 Admin Workflow

1. **Login** as admin (role: admin)
2. **Create Course**:
   - Select type (Diploma/Bachelor/Cert)
   - Enter details
   - Build modules (4 credits each)
   - Review & publish
3. **Manage Courses**: Edit, delete, view
4. **Track Students**: Progress, enrollments
5. **Generate Certificates**: Auto-issue on completion

---

## 💡 Key Features Implemented

✅ Full authentication (JWT)  
✅ Course creation wizard (3-step)  
✅ Module builder with credit system  
✅ Video integration (Vimeo ready)  
✅ AI tutor (OpenAI/Emergent)  
✅ Progress tracking  
✅ Certificate generation  
✅ Admin dashboard  
✅ Student dashboard  
✅ Course catalog  
✅ Responsive design  
✅ Dark theme with gradients  
✅ API documentation  

---

## 🔮 Next Steps

1. **Upload hero-bg.mp4** to `/app/frontend/public/videos/`
2. **Add API Keys** to backend `.env`:
   - OpenAI or Emergent LLM key
   - Vimeo credentials
3. **Deploy to Vercel** (frontend)
4. **Deploy Backend** (Render/Railway)
5. **Set up MongoDB Atlas** (production)
6. **Test course creation** flow
7. **Generate sample courses** via admin panel

---

## 📞 Support

- Documentation: See inline code comments
- API Docs: http://localhost:8001/docs
- Supabase Guide: `SUPABASE_SETUP.md`

---

**Built with ❤️ for Right Tech Centre**

Logo: Yellow-green tech theme, AI-powered learning, global certification platform.

Deploy and start creating courses! 🚀
