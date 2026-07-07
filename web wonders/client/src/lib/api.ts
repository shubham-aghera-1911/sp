const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("studyos_token");
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // no body
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
}

// ── Auth ─────────────────────────────────────────────────────────────────
export const authApi = {
  register: (body: { name: string; email: string; password: string; major?: string }) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),
};

// ── Generic CRUD factory ────────────────────────────────────────────────
function crud(resource: string) {
  return {
    list: () => request(`/${resource}`),
    create: (body: any) => request(`/${resource}`, { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: any) => request(`/${resource}/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    remove: (id: string) => request(`/${resource}/${id}`, { method: "DELETE" }),
  };
}

export const assignmentsApi = crud("assignments");
export const examsApi = crud("exams");
export const attendanceApi = crud("attendance");
export const notesApi = crud("notes");
export const gradesApi = { ...crud("grades"), gpa: () => request("/grades/gpa") };
export const remindersApi = crud("reminders");
export const timetableApi = crud("timetable");

export const projectsApi = {
  ...crud("projects"),
  addTask: (projectId: string, body: { title: string; assignee?: string }) =>
    request(`/projects/${projectId}/tasks`, { method: "POST", body: JSON.stringify(body) }),
  updateTask: (projectId: string, taskId: string, body: any) =>
    request(`/projects/${projectId}/tasks/${taskId}`, { method: "PUT", body: JSON.stringify(body) }),
  removeTask: (projectId: string, taskId: string) =>
    request(`/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" }),
};

export const timerApi = {
  history: () => request("/timer"),
  logSession: (body: { subject?: string; durationMinutes: number }) =>
    request("/timer", { method: "POST", body: JSON.stringify(body) }),
};

export const plannerApi = {
  generate: () => request("/planner"),
};

export const seedApi = {
  run: () => request("/seed", { method: "POST" }),
};

export function setToken(token: string | null) {
  if (token) localStorage.setItem("studyos_token", token);
  else localStorage.removeItem("studyos_token");
}
export function hasToken() {
  return !!getToken();
}
