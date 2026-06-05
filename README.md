# 🚀 AppForge — AI App Generator

**Track A — Full Stack Engineer** | AI Software Engineer Internship Demo Task

A metadata-driven application runtime powered by **Groq AI (LLaMA 3.3 70B)** that converts plain-English descriptions into fully interactive web applications in seconds.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 AI Generation | LLaMA 3.3 70B via Groq generates full app configs from one sentence |
| 🧩 10+ Components | Forms, tables, kanban, charts, timelines, stats, galleries, heroes, lists |
| 🛡️ Bulletproof Sanitizer | Handles missing fields, invalid types, broken JSON, unknown components gracefully |
| ✏️ AI Editing | Modify any app with natural language ("add a revenue chart") |
| 📥 JSON Export | Download the raw config for any app |
| 📋 App Dashboard | Grid/list view, search, delete — manage all your apps |
| 🎨 Beautiful UI | Pink-purple glassmorphism, Syne + DM Sans typography |

---

## 🚀 Quick Start

```bash
# 1. Extract / clone the project
cd ai-app-generator

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env → add GROQ_API_KEY (free at https://console.groq.com)

# 4. Start dev server
npm run dev
```

Open **http://localhost:3000**

### Build for Production
```bash
npm run build
npm start
```

---

## 🔑 Environment Variables

```
GROQ_API_KEY=gsk_...    # Required – get free at console.groq.com
DATABASE_URL=...         # Optional – only needed if switching to PostgreSQL
```

---

## 🏗️ Architecture

```
User Prompt
    │
    ▼
POST /api/generate
    │
    ├── groq.ts → LLaMA 3.3 70B via Groq API
    │              (structured JSON prompt)
    │
    ├── sanitizer.ts → validates + normalizes config
    │                  (handles all edge cases)
    │
    └── db.ts → stores in data/db.json
                    │
                    ▼
            /apps/[id] → ComponentRenderer
                         ├── FormRenderer
                         ├── TableRenderer
                         └── WidgetRenderers
                             ├── StatsRenderer
                             ├── ChartRenderer
                             ├── KanbanRenderer
                             ├── TimelineRenderer
                             ├── HeroRenderer
                             ├── ListRenderer
                             └── GalleryRenderer
```

---

## 🧩 Component Types

| Type | What it renders |
|------|----------------|
| `form` | Interactive form with 10+ field types (text, email, select, textarea, toggle, radio, range, color, date, file) |
| `table` | Sortable, searchable, paginated data table with badge/date/boolean column types |
| `stats` | KPI stat cards with trend indicators (↑↓) |
| `chart` | Bar, line, pie, donut, area charts (pure SVG/CSS — no chart library dependency) |
| `kanban` | Drag-friendly kanban board with columns and add-task |
| `timeline` | Visual event timeline with color dots |
| `hero` | Full-width hero banner section |
| `card` | Container card with nested children |
| `list` | Item list with icons and values |
| `gallery` | Responsive image grid |
| `dashboard` | Layout container for sub-components |

---

## 🛡️ Error Handling Strategy

The `sanitizer.ts` is the core resilience layer. It handles:

- **Missing required fields** → sensible defaults
- **Invalid component types** → fallback card with warning
- **Invalid field types** → fallback to `text` input
- **Truncated/broken AI JSON** → extraction + repair
- **Non-array `fields`/`columns`/`data`** → coerced to empty array
- **Non-string values** → safely cast to string
- **Deeply nested errors** → isolated, never crash parent

All warnings are collected and surfaced in the UI without crashing the app.

---

## 📁 Project Structure

```
ai-app-generator/
├── app/
│   ├── page.tsx                  # Landing page + prompt input
│   ├── dashboard/page.tsx        # App manager (grid + list view)
│   ├── apps/[id]/page.tsx        # App viewer + AI edit panel
│   ├── error.tsx                 # Global error boundary
│   ├── not-found.tsx             # 404 page
│   ├── loading.tsx               # Loading state
│   ├── layout.tsx                # Root layout + toast provider
│   ├── globals.css               # Pink-purple glassmorphism theme
│   └── api/
│       ├── generate/route.ts     # POST: Generate new app
│       └── apps/
│           ├── route.ts          # GET: List all apps
│           └── [id]/
│               ├── route.ts      # GET/PATCH/DELETE: Single app
│               └── export/       # GET: Download config JSON
├── components/
│   └── renderer/
│       ├── ComponentRenderer.tsx # Orchestrator — routes to correct renderer
│       ├── FormRenderer.tsx      # Forms (10+ field types, validation UI)
│       ├── TableRenderer.tsx     # Sortable, paginated, searchable table
│       └── WidgetRenderers.tsx   # Stats, Chart, Kanban, Timeline, Hero, List, Gallery
├── lib/
│   ├── groq.ts                  # Groq AI integration + prompting
│   ├── sanitizer.ts             # Config validation & normalization
│   ├── db.ts                    # JSON file database (zero-setup)
│   └── utils.ts                 # Utilities (cn, formatDate, etc.)
├── types/
│   └── index.ts                 # All TypeScript interfaces
├── data/
│   └── db.json                  # Auto-created app storage
├── .env.example                 # Environment template
└── README.md
```

---

## 🌐 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import in Vercel dashboard
3. Add `GROQ_API_KEY` environment variable
4. Deploy — done ✓

> **Note on database:** `data/db.json` works perfectly for demo/MVP. For production with persistent storage, swap `lib/db.ts` to use Neon PostgreSQL + Prisma — the interface is a clean 5-function abstraction.

### Other Platforms
- **Railway**: Add env var, push to deploy
- **Render**: Static site or web service
- **Cloudflare Pages**: Works with edge runtime

---

## 🎯 Example Prompts to Try

```
CRM dashboard with pipeline management, contact list, and deal tracking
E-commerce admin with product catalog, order management, and revenue analytics
HR system with employee profiles, leave requests, and payroll overview
Hospital patient portal with appointments, prescriptions, and billing
School management with student records, grades, attendance, and timetable
Real estate platform with property listings, agent profiles, and inquiry forms
Startup project tracker with sprint board, team directory, and OKR dashboard
```

---

## 🛠️ Tech Stack

| | Technology | Why |
|--|-----------|-----|
| Framework | Next.js 15 (App Router) | Server components, API routes, fast routing |
| Language | TypeScript | Type safety across config, sanitizer, renderer |
| AI | Groq + LLaMA 3.3 70B | Fastest inference, best JSON generation |
| Styling | TailwindCSS + custom CSS | Utility-first + glassmorphism theme |
| Database | JSON file store | Zero setup, easy to inspect, swap-ready |
| Charts | Pure SVG/CSS | No library dependency, fully custom |
| Icons | Lucide React | Consistent, lightweight |
| Toast | React Hot Toast | Clean notifications |
| Fonts | Syne + DM Sans | Distinctive, readable |

---

*Built with ❤️ — Next.js + Groq AI + TypeScript + TailwindCSS*
