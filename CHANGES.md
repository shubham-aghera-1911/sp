# Chat feature — what changed

Everything below was added or edited directly in your actual codebase (not
generic scaffolding) — field names match your real `Project`/`User` models
(`user` as owner, `members` array, `hasAccess()` helper reused from
`projectController.js`).

## New files
**Backend**
- `backend/models/Message.js` — group messages have `receiver: null`; DMs have both `sender` and `receiver` set.
- `backend/controllers/chatController.js` — reuses `hasAccess()` from `projectController.js`, same `loadAccessibleProject` pattern as `taskController.js`.
- `backend/routes/chatRoutes.js` — mounted at `/api/projects/:projectId/chat`.
- `backend/socket/chat.js` — Socket.io, authenticated with your existing JWT (`JWT_SECRET`).

**Frontend**
- `frontend/src/api/chat.js` — uses your existing `api` axios instance (already attaches the `taskflow_token`).
- `frontend/src/context/SocketContext.jsx` — connects once `user` is set in `AuthContext`, disconnects on logout.
- `frontend/src/components/chat/ChatPanel.jsx` — right-side slide-over (opens over the Kanban board).
- `frontend/src/components/chat/ChatMemberList.jsx` — group chat tab + every project member, owner tagged.
- `frontend/src/components/chat/GroupChatView.jsx` — visible to and postable by every project member.
- `frontend/src/components/chat/DirectChatView.jsx` — private 1:1, works for any member ↔ member or member ↔ owner.

## Edited files
- `backend/server.js` — wrapped `app` in `http.createServer` so Socket.io can attach; mounted chat routes; `req.io` middleware added; `app.listen` → `server.listen`.
- `backend/package.json` — added `socket.io`.
- `frontend/src/main.jsx` — added `SocketProvider` inside `AuthProvider`.
- `frontend/src/pages/ProjectDetails.jsx` — added a "Chat" button next to "Team"/"New task", opens `ChatPanel`.
- `frontend/package.json` — added `socket.io-client`.
- `frontend/.env.example` — documented optional `VITE_SOCKET_URL`.

## Privacy — how it's actually enforced, not just hidden in the UI
- Every chat route is gated by `loadAccessibleProject`, so a non-member gets a 404, same as your existing task routes.
- The DM query is `$or: [{sender: me, receiver: them}, {sender: them, receiver: me}]` — this can never return a thread you're not part of, even for the project owner.
- Real-time DM events go to a room named from a **sorted pair of user IDs** (`dm:<projectId>:<id1>:<id2>`), and a socket only joins after JWT auth confirms it's actually one of those two users. Group messages go to a separate `project:<id>` room open to any verified member.

## To run it
```
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```
No new env vars are required — chat reuses your existing `JWT_SECRET` and `CLIENT_URL`. `VITE_SOCKET_URL` is optional; it defaults to your `VITE_API_URL` origin.

I verified: all backend files pass `node --check`, all backend modules `require()` cleanly, and `npm run build` succeeds on the frontend with no errors.
