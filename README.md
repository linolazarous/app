# CursorCode AI

**Build Anything. Automatically. With AI.**

CursorCode AI is an autonomous AI software engineering platform powered by xAI's Grok family with intelligent multi-model routing. It replaces entire development teams by understanding user intent, automatically designing system architecture, writing production-grade code, designing UI/UX, and deploying to cloud with zero manual DevOps.

![CursorCode AI](./frontend/public/logo.png)

## Features

- **Multi-Agent AI System**: Coordinated agents powered by xAI Grok with intelligent routing for architecture, code, DevOps, and security
- **Production-Grade Code**: Generate clean, scalable, documented code with proper error handling, types, and best practices
- **One-Click Deploy**: Deploy to CursorCode.app or external platforms with auto-SSL, scaling, and monitoring
- **Enterprise Security**: OAuth/JWT/SSO, encrypted API vaults, RBAC, audit logs, and GDPR-ready infrastructure
- **Intelligent Model Routing**: Automatically selects optimal Grok model per task - frontier reasoning or fast agentic workflows

## Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: MongoDB with Motor async driver
- **Authentication**: JWT with bcrypt password hashing
- **Payments**: Stripe (subscription billing)
- **Email**: SendGrid
- **AI**: xAI Grok API (OpenAI-compatible)

### Frontend
- **Framework**: React 19 with React Router
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/UI (Radix primitives)
- **Animations**: Framer Motion
- **Code Editor**: Monaco Editor
- **Charts**: Recharts

## Project Structure

```
/app
├── backend/
│   ├── server.py          # FastAPI application with all routes
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/   # React components (including Shadcn UI)
│   │   ├── context/      # React context providers
│   │   ├── lib/          # Utilities and API client
│   │   └── pages/        # Page components
│   ├── public/           # Static assets (logo, etc.)
│   └── package.json      # Node dependencies
├── tests/                # Test files
├── docs/                 # Documentation
└── README.md
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB (local or cloud)
- Yarn package manager

### Environment Variables

#### Backend (`/backend/.env`)
```env
# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=cursorcode

# CORS
CORS_ORIGINS=*

# Security
JWT_SECRET_KEY=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# xAI (Grok) API
XAI_API_KEY=your-xai-api-key
DEFAULT_XAI_MODEL=grok-4-latest
FAST_REASONING_MODEL=grok-4-1-fast-reasoning
FAST_NON_REASONING_MODEL=grok-4-1-fast-non-reasoning

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STANDARD_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_PREMIER_PRICE_ID=price_...
STRIPE_ULTRA_PRICE_ID=price_...

# SendGrid
SENDGRID_API_KEY=SG...
EMAIL_FROM=info@cursorcode.ai

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000
```

#### Frontend (`/frontend/.env`)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/cursorcode-ai.git
cd cursorcode-ai
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Frontend Setup**
```bash
cd frontend
yarn install
```

4. **Start Development Servers**

Backend:
```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

Frontend:
```bash
cd frontend
yarn start
```

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/login` | Login and get tokens |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh` | Refresh access token |

### Project Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create new project |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| PUT | `/api/projects/:id/files` | Update project files |

### AI Generation Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/generate` | Generate code with AI |
| GET | `/api/ai/models` | List available AI models |

### Subscription Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/plans` | Get all subscription plans |
| POST | `/api/subscriptions/create-checkout` | Create Stripe checkout |
| GET | `/api/subscriptions/current` | Get user's subscription |

### Admin Endpoints (requires admin role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/usage` | AI usage analytics |

## Deployment

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
```

### Environment-Specific Configuration

For production deployment on Render/Railway/Fly.io:

1. Set all environment variables in your platform's dashboard
2. Ensure MongoDB is accessible (MongoDB Atlas recommended)
3. Configure Stripe webhook endpoint
4. Update CORS origins for your domain

## Pricing Plans

| Plan | Price | Credits/Month | Features |
|------|-------|---------------|----------|
| Starter | Free | 10 | 1 project, subdomain deploy |
| Standard | $29 | 75 | Full-stack, version history |
| Pro | $59 | 150 | SaaS, advanced agents, CI/CD |
| Premier | $199 | 600 | Multi-org, security scans |
| Ultra | $499 | 2,000 | Unlimited, dedicated compute |

## AI Model Routing

CursorCode AI intelligently routes tasks to the optimal Grok model:

- **grok-4-latest**: Deep reasoning for architecture and complex tasks (3 credits)
- **grok-4-1-fast-reasoning**: Agentic workflows and tool-calling (2 credits)
- **grok-4-1-fast-non-reasoning**: High-throughput generation (1 credit)

## Security

- JWT-based authentication with refresh tokens
- bcrypt password hashing
- Rate limiting on API endpoints
- RBAC for admin access
- Encrypted API key storage
- GDPR-compliant data handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Proprietary - © 2025 CursorCode AI. All rights reserved.

## Support

- **Email**: info@cursorcode.ai
- **Documentation**: https://docs.cursorcode.ai
- **Status**: https://status.cursorcode.ai
