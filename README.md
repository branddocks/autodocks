# AutoDocks 🚀

AI-powered social media content engine for digital marketing agencies.

Generate branded content calendars, create images, and auto-post to Instagram — for every client. One click.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Auth:** NextAuth.js (Google OAuth + Credentials)
- **AI:** Gemini 2.5 Flash (text) + Google Imagen (images)
- **Payments:** Razorpay Subscriptions
- **Storage:** Cloudflare R2
- **Hosting:** Vercel

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local
# Fill in all values in .env.local

# 3. Set up database
npx prisma generate
npx prisma migrate dev

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Signup pages
│   ├── (dashboard)/     # Dashboard, Clients, Calendar, Queue, Settings
│   ├── api/             # API routes (auth, clients, generate)
│   ├── globals.css      # Design system
│   ├── layout.tsx       # Root layout with fonts
│   └── page.tsx         # Landing page
├── lib/
│   ├── auth.ts          # NextAuth configuration
│   ├── prisma.ts        # Prisma client singleton
│   └── utils.ts         # Utility functions
└── prisma/
    └── schema.prisma    # Database schema
```

## Day 1 Checklist

- [x] Project initialized
- [x] Database schema designed
- [x] Auth system (Google OAuth + email/password)
- [x] Landing page
- [x] Login / Signup pages
- [x] Dashboard layout with sidebar
- [x] Client management (list + add form)
- [x] API routes (signup, clients CRUD)
- [ ] Connect to Supabase
- [ ] Create Facebook Developer App
- [ ] Get Gemini API key

Built by [Brand Docks](https://branddocks.com) · Junagadh, India
