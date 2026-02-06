# Deployment Guide

## Production Environment Variables

### Backend (.env)

```env
# Database (MongoDB Atlas recommended)
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/
DB_NAME=cursorcode_prod

# CORS (your frontend domain)
CORS_ORIGINS=https://cursorcode.ai,https://www.cursorcode.ai

# Security (generate strong secrets)
JWT_SECRET_KEY=generate-256-bit-secret
JWT_REFRESH_SECRET=generate-another-256-bit-secret

# xAI Grok API
XAI_API_KEY=xai-your-production-key
DEFAULT_XAI_MODEL=grok-4-latest
FAST_REASONING_MODEL=grok-4-1-fast-reasoning
FAST_NON_REASONING_MODEL=grok-4-1-fast-non-reasoning

# Stripe (production keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STANDARD_PRICE_ID=price_standard
STRIPE_PRO_PRICE_ID=price_pro
STRIPE_PREMIER_PRICE_ID=price_premier
STRIPE_ULTRA_PRICE_ID=price_ultra

# SendGrid
SENDGRID_API_KEY=SG.production-key
EMAIL_FROM=info@cursorcode.ai

# Frontend URL
FRONTEND_URL=https://cursorcode.ai
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=https://api.cursorcode.ai
```

## Render Deployment

### Backend Service
1. Create new Web Service
2. Connect your GitHub repository
3. Settings:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3.11

### Frontend Service
1. Create new Static Site
2. Connect your GitHub repository
3. Settings:
   - **Build Command**: `cd frontend && yarn install && yarn build`
   - **Publish Directory**: `frontend/build`

## Docker Compose (Self-hosted)

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8001:8001"
    env_file:
      - ./backend/.env
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  mongodb:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"

volumes:
  mongo_data:
```

## Stripe Setup

1. Create products in Stripe Dashboard for each plan
2. Get Price IDs and add to environment variables
3. Configure webhook endpoint: `https://api.cursorcode.ai/api/subscriptions/webhook`
4. Select events: `checkout.session.completed`, `customer.subscription.*`

## SSL/TLS

- Render/Vercel/Netlify: Automatic SSL
- Self-hosted: Use Let's Encrypt with certbot or Caddy

## Monitoring

Recommended services:
- **Sentry**: Error tracking
- **DataDog/New Relic**: APM
- **MongoDB Atlas**: Database monitoring
