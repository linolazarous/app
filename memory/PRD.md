# CursorCode AI - Product Requirements Document

## Original Problem Statement
Build CursorCode AI - an autonomous AI software engineering platform powered by xAI Grok with intelligent multi-model routing.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI + Framer Motion
- **Backend**: FastAPI + MongoDB + JWT Auth + GitHub OAuth
- **AI**: xAI Grok API with multi-model routing
- **Payments**: Stripe (auto-created products/prices)
- **Email**: SendGrid with verification flow
- **Deployment**: Simulated cursorcode.app infrastructure

## User Personas
1. **Solo Developer**: Build apps faster with AI assistance
2. **Startup Team**: Rapid prototyping and deployment
3. **Enterprise**: Security, compliance, and scalability

## What's Been Implemented (Feb 6, 2025)

### Phase 1 - Core MVP
- Landing page with hero, features, pricing, CTAs
- User auth with JWT tokens and email verification
- User dashboard with project management
- AI code generation workspace with Monaco editor
- Settings page (account, billing, API keys)
- Admin dashboard with analytics
- Pricing page with 5 subscription tiers
- Custom CursorCode AI logo
- Dark "Cyberpunk Precision" theme

### Phase 2 - Enhanced Features
- **Stripe Integration**: Auto-created products/prices on startup
- **Email Verification**: SendGrid-powered verification flow
- **GitHub OAuth**: Login/signup with GitHub
- **GitHub Repos**: List and import repositories
- **Deployment Infrastructure**: Simulated deployment with subdomain URLs
- **Deployment Management**: List, view, delete deployments

## Environment Variables Required (Render)
```
MONGO_URL=
DB_NAME=cursorcode
JWT_SECRET_KEY=
JWT_REFRESH_SECRET=
XAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SENDGRID_API_KEY=
EMAIL_FROM=info@cursorcode.ai
GITHUB_OAUTH_CLIENT_ID=
GITHUB_OAUTH_CLIENT_SECRET=
FRONTEND_URL=https://cursorcode.ai
```

## Next Tasks
1. Configure real xAI API key for AI generation
2. Set up Stripe webhook endpoint in production
3. Configure domain and SSL for cursorcode.app deployments
4. Add project version history
5. Implement real file hosting for deployments
