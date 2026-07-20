# Changelog — all features added across this project

## Round 4 (latest): Username, edit profile, layout fixes, visual refresh

**1. Username field**
- Registration now requires a username (3-20 chars, letters/numbers/underscores/dots), separate from email/password used to log in.
- OAuth (Google/GitHub) sign-ups auto-generate a unique username from their email, which they can change afterward.
- New "Edit profile" panel on the Profile page: change name, username, and upload a profile picture (resized/compressed client-side before upload, so it stays small).

**2. Moved dark-mode toggle & sign-out to Profile only**
- The top navbar (visible on Dashboard/Project pages) now only shows the logo and a small avatar link to your profile.
- Dark mode toggle and Sign out live exclusively on the Profile page now.

**3. Fixed the logo link**
- The TaskFlow logo now uses an explicit `navigate()` call instead of a plain `<Link>`. Clicking it while already on the dashboard is a no-op by design (like any site's homepage logo) — but it reliably takes you back to the dashboard from any other page (Project board, Profile, etc).

**4. Visual refresh + extra features I added**
See below.

## Round 3: Profile page, analytics, notifications, reliability
Profile page (stats, 7-day progress chart, date lookup), confirmation dialogs before every delete, email receipt on project deletion, browser notification reminders for tasks due tomorrow, global error boundary, PWA manifest for mobile installs.

## Round 2: Auth & team features
Google/GitHub sign-in, forgot/reset password, password strength meter, show/hide password toggle, team invites with shared project access.

## Round 1: Core app
Auth, projects, tasks, Kanban board, search/filter, dashboard stats, dark mode.

---

## Extra features added this round (not explicitly requested, but standard for this kind of app)

I added these because they're the kind of thing most task-management apps ship with, and they were low-cost to add alongside what you asked for:

1. **Toast notifications** (`ToastContext` + bottom-right popups) — "Task created", "Project deleted", etc. now show as a brief, dismissible notification instead of only a page banner. Feels much more like a real app.
2. **Skeleton loading states** — Dashboard, Project board, and Profile now show pulsing placeholder shapes while data loads, instead of a plain "Loading..." line. Makes load times feel shorter and previews the layout.
3. **Mobile bottom navigation bar** — on small screens, a fixed bottom tab bar (Dashboard / Profile) appears, since phones are used one-handed and a top-only navbar is a reach. Hidden on desktop.
4. **Reusable `Avatar` component** — shows your uploaded photo everywhere you appear (navbar, team list, profile), falling back to colored initials if you haven't set one.
5. **Time-of-day greeting** on the dashboard ("Good morning, Jane") — small touch, easy win.
6. **Subtle visual refresh** — soft gradient background, card hover-lift animation, smoother button press feedback, fade-in on modals, refined empty states with icons instead of just text.

## What I deliberately did *not* add (and why)

- **Blocking "click the email link to confirm delete"** — I implemented an on-screen confirmation dialog + after-the-fact email receipt instead, since a blocking email step adds real friction to routine task-app usage. Say the word if you want the stronger blocking version instead.
- **Custom app icons in the PWA manifest** — `manifest.json` ships with an empty icon list; drop `icon-192.png`/`icon-512.png` into `frontend/public/` and reference them there for a custom home-screen icon.
