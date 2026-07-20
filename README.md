# TaskFlow — Kanban Task Management App

A full-stack MERN application for managing projects and tasks on a Kanban board — with team collaboration, OAuth login, password reset, progress analytics, browser notifications, and dark mode.

## Tech stack

- **Frontend:** React (Vite) + Tailwind CSS + React Router + Axios + Recharts + lucide-react
- **Backend:** Node.js + Express + Passport.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt, plus Google & GitHub OAuth
- **Email:** Nodemailer (password reset + delete receipts)

## Full feature list

**Core**
- Create / read / update / delete projects and tasks, scoped to the logged-in user's access
- Kanban board (Todo / In Progress / Done) with native drag-and-drop and optimistic UI
- Priorities (Low/Medium/High), due dates with overdue highlighting
- Search by title, filter by priority
- Dashboard with live stats and per-project progress bars
- Responsive UI (mobile → desktop), installable as a mobile/desktop PWA
- Dark mode, persisted across sessions

**Authentication**
- Email/password signup & login (bcrypt-hashed passwords)
- **Sign in with Google** and **Sign in with GitHub**
- **Forgot password** — emailed reset link, 30-minute expiry
- Password strength meter on signup
- Show/hide toggle (eye icon) on every password field

**Team collaboration**
- Invite teammates to a project by email (auto-applied if they haven't signed up yet)
- Any team member can view/create/edit/delete tasks on a shared project
- Only the project owner can rename/delete the project or manage membership

**Profile & analytics**
- Profile page: account info, sign out, light/dark toggle
- Progress report chart — tasks completed vs. created over the last 7 days
- Look up any specific date to see exactly what was completed/created

**Reliability & UX**
- Friendly on-screen confirmation dialogs before every delete (project, task, team member)
- Email receipt sent after a project is deleted
- Global error boundary — a crash shows a friendly recovery screen, never a blank page
- Consistent friendly error messages for network/server failures throughout
- Browser notification reminders for tasks due tomorrow (asks permission first)

## Project structure

```
taskflow/
├── README.md
├── NEW_FEATURES.md            # changelog of team/auth features added mid-project
│
├── backend/
│   ├── server.js
│   ├── config/
│   │   ├── db.js
│   │   └── passport.js        # Google/GitHub OAuth strategies
│   ├── utils/
│   │   └── sendEmail.js       # nodemailer wrapper
│   ├── models/                # User, Project, Task
│   ├── middleware/             # auth.js, errorHandler.js
│   ├── controllers/            # auth, project, task
│   ├── routes/                 # auth, project, task
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── index.html
    ├── public/
    │   └── manifest.json      # PWA manifest (mobile "add to home screen")
    ├── tailwind.config.js / vite.config.js / postcss.config.js
    ├── package.json
    ├── .env.example
    └── src/
        ├── main.jsx / App.jsx / index.css
        ├── api/axios.js
        ├── hooks/
        │   └── useNotificationReminders.js
        ├── context/            # AuthContext, ThemeContext
        ├── components/
        │   ├── Navbar, PrivateRoute, ProjectCard, TaskCard, KanbanColumn,
        │   ├── TaskModal, StatsCard, InviteModal, ConfirmDialog, ErrorBoundary,
        │   └── PasswordInput, PasswordStrengthMeter, OAuthButtons, ProgressChart
        └── pages/
            ├── Login, Register, ForgotPassword, ResetPassword, OAuthCallback,
            └── Dashboard, ProjectDetails, Profile
```

## Setup instructions

### 1. Prerequisites
- Node.js 18+
- A MongoDB database — [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier) or local `mongod`

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env` — at minimum:
```
MONGO_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=some_long_random_string
PORT=5000
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```

The rest (`GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_ID`, `SMTP_*`) are **optional** — the app runs fine without them; only Google/GitHub sign-in and the forgot-password email won't work until configured. See "Optional integrations" below.

Run it:
```bash
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm run dev
```

Visit `http://localhost:5173`.

## Optional integrations

**Google Sign-In:** create OAuth credentials at console.cloud.google.com/apis/credentials. Redirect URI: `{SERVER_URL}/api/auth/google/callback`.

**GitHub Sign-In:** create an OAuth App at github.com/settings/developers. Callback URL: `{SERVER_URL}/api/auth/github/callback`.

**Password reset emails:** for local testing, [Mailtrap](https://mailtrap.io) gives a free SMTP sandbox — set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`. Without this configured, the reset link is logged to the backend terminal instead, so you can still test the flow.

**Browser notification icons for the PWA:** `frontend/public/manifest.json` ships with an empty `icons` array — add your own `icon-192.png` / `icon-512.png` to `frontend/public/` and reference them there if you want a custom home-screen icon.

## API reference

All routes below except registration, login, forgot/reset-password, and the OAuth routes require an `Authorization: Bearer <token>` header.

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/forgot-password` | Request a reset email |
| PUT | `/api/auth/reset-password/:token` | Set a new password |
| GET | `/api/auth/google` → `/google/callback` | Google OAuth flow |
| GET | `/api/auth/github` → `/github/callback` | GitHub OAuth flow |

### Projects
| Method | Route | Description |
|---|---|---|
| GET | `/api/projects` | List projects you own or are a member of |
| GET / PUT / DELETE | `/api/projects/:id` | Get / update (owner) / delete (owner) |
| POST | `/api/projects` | Create |
| POST | `/api/projects/:id/invite` | Invite a teammate by email (owner) |
| DELETE | `/api/projects/:id/members/:userId` | Remove a member (owner) |

### Tasks
| Method | Route | Description |
|---|---|---|
| GET | `/api/tasks?project=&status=&priority=&search=&sortBy=` | List with filters |
| GET | `/api/tasks/stats` | Dashboard counts |
| GET | `/api/tasks/progress?days=7` | Completed/created per day |
| GET | `/api/tasks/progress/day?date=YYYY-MM-DD` | Activity on one date |
| GET | `/api/tasks/due-tomorrow` | Tasks due tomorrow (for reminders) |
| POST / PUT / DELETE | `/api/tasks` / `/api/tasks/:id` | Create / update / delete |

## Deployment

- **Frontend:** [Vercel](https://vercel.com) — set `VITE_API_URL` to your backend URL
- **Backend:** [Render](https://render.com) — set all `.env` vars; update `SERVER_URL` and `CLIENT_URL` to your live URLs (this also updates your OAuth app's redirect URIs)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
