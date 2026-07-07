# StudyOS — Student Productivity OS (MERN Stack)

A full-stack student productivity app built on **MongoDB, Express, React, Node.js**.

The UI (dark theme, sidebar layout, all 11 modules) is adapted from the Figma
export you provided (`Student_Productivity_OS.zip`) — the same components and
styling, now wired up to a real Node/Express/MongoDB backend with JWT
authentication instead of hardcoded mock data.

## Features

- **Auth**: signup / login with JWT, passwords hashed with bcrypt, each user only sees their own data
- **Assignments** — CRUD, priorities, due dates, filters
- **Exam Countdown** — CRUD, live day-countdown
- **Attendance Tracker** — per-subject present/absent logging with % + chart
- **Notes** — CRUD, pin, per-subject tagging
- **Timetable** — weekly class schedule
- **Study Timer** — Pomodoro timer, sessions logged to the database
- **Group Projects** — projects with team members and a task checklist
- **AI Study Planner** — auto-generates a weekly study plan from your assignments and exams
- **GPA Calculator** — per-semester and cumulative GPA
- **Reminders** — CRUD, sorted by date/time

On your first signup, the account is automatically seeded with sample data
(subjects, assignments, exams, etc.) so the dashboard isn't empty. You can
delete/edit anything freely afterward.

## Project structure

```
project/
├─ server/     Express API + MongoDB models (Node.js)
└─ client/     React + Vite + Tailwind frontend
```

## 1. Prerequisites

- **Node.js 18+** and **npm** — check with `node -v` and `npm -v`
- **MongoDB** — either:
  - Install locally: https://www.mongodb.com/docs/manual/installation/, or
  - Use a free cloud cluster on **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas/register
    (grab the connection string — looks like `mongodb+srv://user:pass@cluster.mongodb.net/studyos`)

## 2. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and set:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/studyos      # or your Atlas connection string
JWT_SECRET=some_long_random_string_here
CLIENT_ORIGIN=http://localhost:5173
```

Generate a strong `JWT_SECRET` quickly with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Start the API:

```bash
npm run dev      # auto-restarts on changes
# or
npm start
```

You should see:

```
MongoDB connected: 127.0.0.1/studyos
Server running on http://localhost:5000
```

Verify it's alive: open http://localhost:5000/api/health — you should see `{"status":"ok"}`.

## 3. Frontend setup

Open a **second terminal**:

```bash
cd client
npm install
cp .env.example .env
```

The default `.env` (`VITE_API_URL=http://localhost:5000/api`) is already correct
for local development — only change it if your backend runs elsewhere.

Start the dev server:

```bash
npm run dev
```

Vite will print a local URL, typically **http://localhost:5173**. Open it in your browser.

## 4. Using the app

1. Click **Sign up**, create an account (name, email, password 6+ chars).
2. Your account is auto-seeded with sample assignments, exams, notes, etc.
3. Explore the sidebar — every module persists to MongoDB, so refreshing or
   logging in from another device shows the same data.
4. Log out any time with the icon at the bottom of the sidebar.

## 5. Building for production (optional)

```bash
cd client
npm run build       # outputs static files to client/dist
```

Serve `client/dist` with any static host (Netlify, Vercel, Nginx, or Express's
`express.static`), and deploy `server/` to any Node host (Render, Railway,
Fly.io, a VPS, etc.) with the same environment variables set there.

## Notes on the "AI Study Planner"

The planner (`GET /api/planner`) currently uses a rule-based algorithm that
ranks your pending assignments and upcoming exams by urgency and spreads them
across the week — no external API key required. If you want to upgrade it to
call a real LLM, add your Anthropic/OpenAI key as an environment variable on
the server and swap the logic in `server/routes/planner.js`.

## Troubleshooting

- **"Failed to connect to MongoDB"** — make sure MongoDB is running locally
  (`mongod`) or that your Atlas connection string, username/password, and
  IP allowlist (Atlas → Network Access) are correct.
- **CORS errors in the browser console** — make sure `CLIENT_ORIGIN` in
  `server/.env` matches the URL your frontend is actually running on.
- **401 errors after login** — your JWT may have expired (30 days) or
  `JWT_SECRET` changed after the token was issued; just log in again.
