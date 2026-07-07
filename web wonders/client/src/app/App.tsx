import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, CheckSquare, BarChart3, FileText,
  Calendar, Timer, Users, Brain, GraduationCap, Bell,
  Plus, Trash2, Play, Pause, RotateCcw, AlertTriangle,
  Zap, Award, Star, Menu, CheckCircle2, LogOut,
  Trophy, Crown, Sparkles, X, Info,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import {
  assignmentsApi, examsApi, attendanceApi, notesApi, projectsApi,
  gradesApi, remindersApi, timetableApi, timerApi, plannerApi,
} from "../lib/api";

// ── Types ──────────────────────────────────────────────────────────────────
type Section =
  | "dashboard" | "assignments" | "exams" | "attendance"
  | "notes" | "timetable" | "timer" | "projects"
  | "planner" | "gpa" | "reminders" | "rewards";
type Priority = "high" | "medium" | "low";

interface Assignment { id: string; title: string; subject: string; dueDate: string; priority: Priority; done: boolean; type: string; }
interface Exam { id: string; subject: string; date: string; time: string; room: string; color: string; }
interface AttendanceRecord { id: string; subject: string; attended: number; total: number; color: string; }
interface Note { id: string; title: string; subject: string; content: string; date: string; pinned: boolean; }
interface ProjectTask { id: string; title: string; done: boolean; assignee: string; }
interface Project { id: string; name: string; subject: string; deadline: string; members: string[]; progress: number; tasks: ProjectTask[]; }
interface Grade { id: string; subject: string; credits: number; grade: string; semester: string; }
interface Reminder { id: string; title: string; date: string; time: string; type: "assignment" | "exam" | "event" | "study"; done: boolean; }
interface TimetableSlotT { id: string; day: string; time: string; end: string; subject: string; room: string; type: string; }

// ── Mappers: backend Mongo docs (_id) -> frontend shape (id) ────────────────
const mapAssignment = (d: any): Assignment => ({ id: d._id, title: d.title, subject: d.subject, dueDate: d.dueDate, priority: d.priority, done: d.done, type: d.type });
const mapExam = (d: any): Exam => ({ id: d._id, subject: d.subject, date: d.date, time: d.time, room: d.room, color: d.color });
const mapAttendance = (d: any): AttendanceRecord => ({ id: d._id, subject: d.subject, attended: d.attended, total: d.total, color: d.color });
const mapNote = (d: any): Note => ({ id: d._id, title: d.title, subject: d.subject, content: d.content, date: (d.updatedAt || d.createdAt || "").slice(0, 10), pinned: d.pinned });
const mapProject = (d: any): Project => ({ id: d._id, name: d.name, subject: d.subject, deadline: d.deadline, members: d.members, progress: d.progress ?? 0, tasks: (d.tasks || []).map((t: any) => ({ id: t._id, title: t.title, done: t.done, assignee: t.assignee })) });
const mapGrade = (d: any): Grade => ({ id: d._id, subject: d.subject, credits: d.credits, grade: d.grade, semester: d.semester });
const mapReminder = (d: any): Reminder => ({ id: d._id, title: d.title, date: d.date, time: d.time, type: d.type, done: d.done });
const mapSlot = (d: any): TimetableSlotT => ({ id: d._id, day: d.day, time: d.time, end: d.end, subject: d.subject, room: d.room, type: d.type });

// ── Constants ──────────────────────────────────────────────────────────────
const GRADE_PTS: Record<string, number> = {
  "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0,
};
const SUB_COLORS: Record<string, string> = {
  "Mathematics": "#7c3aed", "Computer Science": "#0ea5e9",
  "Environmental Science": "#10b981", "Chemistry": "#f59e0b",
  "Business Studies": "#ef4444", "Literature": "#ec4899",
};

// One-time "what does this do" messages shown the first time a user opens
// each section. Dismissed state is remembered in localStorage so it never
// shows again for that browser/user.
const SECTION_INFO: Record<Section, string> = {
  dashboard: "Your at-a-glance overview — pending tasks, next exam, attendance and GPA, plus what's coming up today.",
  assignments: "Track homework and assignments. Add one with a due date and priority, then check it off when it's done.",
  exams: "Keep every exam on your radar with a live countdown so nothing sneaks up on you.",
  attendance: "Log attendance per subject to see your percentage and stay above the cutoff you need.",
  notes: "Write and organize study notes by subject. Pin the ones you refer back to most.",
  timetable: "Your weekly class schedule, laid out day by day so you always know where to be.",
  timer: "A Pomodoro-style focus timer — work in focused sprints with short breaks in between, and build up your session count.",
  projects: "Manage group projects: track members, tasks, and overall progress toward the deadline.",
  planner: "Get an AI-generated study plan based on your workload, exams, and free time.",
  gpa: "Log your grades by semester to calculate your GPA and cumulative GPA automatically.",
  reminders: "Set one-off reminders for assignments, exams, events, or study sessions so nothing gets forgotten.",
  rewards: "Earn XP and badges for staying on top of your work, and see how you rank on the leaderboard.",
};

// Starts at zero for every new user — this will reflect real logged study time
// once study-hours-per-subject tracking is wired up to the backend.
const STUDY_HOURS = [
  { name: "Math", hours: 0, fill: "#7c3aed" },
  { name: "CS", hours: 0, fill: "#0ea5e9" },
  { name: "EnvSci", hours: 0, fill: "#10b981" },
  { name: "Chem", hours: 0, fill: "#f59e0b" },
  { name: "Biz", hours: 0, fill: "#ef4444" },
  { name: "Lit", hours: 0, fill: "#ec4899" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function daysUntil(d: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(d).getTime() - today.getTime()) / 86400000);
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function calcGPA(gs: Grade[]) {
  if (!gs.length) return 0;
  const pts = gs.reduce((s, g) => s + (GRADE_PTS[g.grade] ?? 0) * g.credits, 0);
  const cr = gs.reduce((s, g) => s + g.credits, 0);
  return cr ? pts / cr : 0;
}
function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

// ── Component ──────────────────────────────────────────────────────────────
export default function App() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState<Section>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // One-time section intro banners — read which ones the user already
  // dismissed from localStorage so we never show them again.
  const [seenInfo, setSeenInfo] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem("spos_seen_section_info") || "{}");
    } catch {
      return {};
    }
  });
  const dismissInfo = (section: Section) => {
    setSeenInfo(prev => {
      const next = { ...prev, [section]: true };
      try { localStorage.setItem("spos_seen_section_info", JSON.stringify(next)); } catch {}
      return next;
    });
  };
  const InfoBanner = (section: Section) => {
    if (seenInfo[section]) return null;
    return (
      <div className="flex items-start gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 mb-5">
        <Info size={16} className="text-primary shrink-0 mt-0.5" />
        <p className="text-[12.5px] text-foreground/90 flex-1">{SECTION_INFO[section]}</p>
        <button onClick={() => dismissInfo(section)} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground shrink-0">
          <X size={14} />
        </button>
      </div>
    );
  };

  // Assignments
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignFilter, setAssignFilter] = useState<"all" | "pending" | "done">("all");
  const [showNewAssign, setShowNewAssign] = useState(false);
  const [newAssign, setNewAssign] = useState({ title: "", subject: "Mathematics", dueDate: "", priority: "medium" as Priority, type: "Homework" });

  // Exams
  const [exams, setExams] = useState<Exam[]>([]);
  const [showNewExam, setShowNewExam] = useState(false);
  const [newExam, setNewExam] = useState({ subject: "Mathematics", date: "", time: "", room: "", color: "#7c3aed" });

  // Notes
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string>("");

  // Timetable
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlotT[]>([]);
  const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timetableByDay = DAY_ORDER.map(day => ({
    day,
    slots: timetableSlots.filter(s => s.day === day).sort((a, b) => a.time.localeCompare(b.time)),
  }));
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  // Timer
  const [timerWork, setTimerWork] = useState(true);
  const [timerSecs, setTimerSecs] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimerSecs(s => {
          if (s <= 1) {
            setTimerRunning(false);
            if (timerWork) {
              setSessions(n => n + 1);
              setTimerWork(false);
              timerApi.logSession({ durationMinutes: 25 }).catch(() => {});
              return 5 * 60;
            } else { setTimerWork(true); return 25 * 60; }
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning, timerWork]);

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjId, setActiveProjId] = useState<string>("");

  // GPA
  const [grades, setGrades] = useState<Grade[]>([]);
  const [semFilter, setSemFilter] = useState("");
  const [showNewGrade, setShowNewGrade] = useState(false);
  const [newGrade, setNewGrade] = useState({ subject: "", credits: "3", grade: "A" });

  // Attendance
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  // Reminders
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showNewRemind, setShowNewRemind] = useState(false);
  const [newRemind, setNewRemind] = useState({ title: "", date: "", time: "09:00", type: "assignment" as Reminder["type"] });

  // AI Planner
  const [aiPlan, setAiPlan] = useState<{ day: string; sessions: { time: string; subject: string; topic: string; intensity: string }[] }[]>([]);
  const [plannerNote, setPlannerNote] = useState("");

  // ── Load everything from the backend once on mount ──────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [a, e, at, n, p, g, r, t] = await Promise.all([
          assignmentsApi.list(), examsApi.list(), attendanceApi.list(), notesApi.list(),
          projectsApi.list(), gradesApi.list(), remindersApi.list(), timetableApi.list(),
        ]);
        const assignList = a.map(mapAssignment);
        const noteList = n.map(mapNote);
        const projList = p.map(mapProject);
        const gradeList = g.map(mapGrade);
        setAssignments(assignList);
        setExams(e.map(mapExam));
        setAttendance(at.map(mapAttendance));
        setNotes(noteList);
        if (noteList[0]) setActiveNoteId(noteList[0].id);
        setProjects(projList);
        if (projList[0]) setActiveProjId(projList[0].id);
        setGrades(gradeList);
        const sems = [...new Set(gradeList.map((x: Grade) => x.semester))];
        if (sems[sems.length - 1]) setSemFilter(sems[sems.length - 1] as string);
        setReminders(r.map(mapReminder));
        setTimetableSlots(t.map(mapSlot));

        const history = await timerApi.history();
        setSessions(history.totalSessions || 0);

        const plan = await plannerApi.generate();
        setAiPlan(plan.plan);
        setPlannerNote(plan.note);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setDataLoading(false);
      }
    })();
  }, []);

  // ── Assignment handlers ──────────────────────────────────────────────────
  async function addAssignment() {
    if (!newAssign.title || !newAssign.dueDate) return;
    const created = await assignmentsApi.create(newAssign);
    setAssignments(p => [...p, mapAssignment(created)]);
    setNewAssign({ title: "", subject: "Mathematics", dueDate: "", priority: "medium", type: "Homework" });
    setShowNewAssign(false);
  }
  async function toggleAssignment(a: Assignment) {
    setAssignments(p => p.map(x => x.id === a.id ? { ...x, done: !x.done } : x));
    await assignmentsApi.update(a.id, { done: !a.done });
  }
  async function deleteAssignment(id: string) {
    setAssignments(p => p.filter(x => x.id !== id));
    await assignmentsApi.remove(id);
  }

  // ── Exam handlers ────────────────────────────────────────────────────────
  async function addExam() {
    if (!newExam.subject || !newExam.date || !newExam.time) return;
    const created = await examsApi.create(newExam);
    setExams(p => [...p, mapExam(created)]);
    setNewExam({ subject: "Mathematics", date: "", time: "", room: "", color: "#7c3aed" });
    setShowNewExam(false);
  }
  async function deleteExam(id: string) {
    setExams(p => p.filter(x => x.id !== id));
    await examsApi.remove(id);
  }

  // ── Attendance handlers ──────────────────────────────────────────────────
  async function markAttendance(a: AttendanceRecord, present: boolean) {
    const updated = { attended: present ? a.attended + 1 : a.attended, total: a.total + 1 };
    setAttendance(p => p.map(x => x.id === a.id ? { ...x, ...updated } : x));
    await attendanceApi.update(a.id, updated);
  }

  // ── Note handlers ────────────────────────────────────────────────────────
  async function addNote() {
    const created = await notesApi.create({ title: "Untitled Note", subject: "Mathematics", content: "", pinned: false });
    const note = mapNote(created);
    setNotes(p => [note, ...p]);
    setActiveNoteId(note.id);
  }
  function updateNoteLocal(id: string, patch: Partial<Note>) {
    setNotes(p => p.map(n => n.id === id ? { ...n, ...patch } : n));
  }
  async function saveNote(id: string, patch: Partial<Note>) {
    await notesApi.update(id, patch);
  }
  async function togglePinNote(note: Note) {
    updateNoteLocal(note.id, { pinned: !note.pinned });
    await notesApi.update(note.id, { pinned: !note.pinned });
  }
  async function deleteNote(id: string) {
    setNotes(p => {
      const remaining = p.filter(n => n.id !== id);
      setActiveNoteId(remaining[0]?.id ?? "");
      return remaining;
    });
    await notesApi.remove(id);
  }

  // ── Project handlers ─────────────────────────────────────────────────────
  async function toggleProjectTask(projectId: string, taskId: string, done: boolean) {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const updatedTasks = p.tasks.map(t => t.id === taskId ? { ...t, done: !done } : t);
      return { ...p, tasks: updatedTasks, progress: Math.round(updatedTasks.filter(t => t.done).length / updatedTasks.length * 100) };
    }));
    await projectsApi.updateTask(projectId, taskId, { done: !done });
  }

  // ── Grade handlers ───────────────────────────────────────────────────────
  async function addGrade() {
    if (!newGrade.subject) return;
    const body = { subject: newGrade.subject, credits: parseInt(newGrade.credits), grade: newGrade.grade, semester: semFilter };
    const created = await gradesApi.create(body);
    setGrades(p => [...p, mapGrade(created)]);
    setNewGrade({ subject: "", credits: "3", grade: "A" });
    setShowNewGrade(false);
  }
  async function updateGradeLetter(id: string, grade: string) {
    setGrades(p => p.map(x => x.id === id ? { ...x, grade } : x));
    await gradesApi.update(id, { grade });
  }
  async function deleteGrade(id: string) {
    setGrades(p => p.filter(x => x.id !== id));
    await gradesApi.remove(id);
  }

  // ── Reminder handlers ────────────────────────────────────────────────────
  async function addReminder() {
    if (!newRemind.title || !newRemind.date) return;
    const created = await remindersApi.create(newRemind);
    setReminders(p => [...p, mapReminder(created)]);
    setNewRemind({ title: "", date: "", time: "09:00", type: "assignment" });
    setShowNewRemind(false);
  }
  async function toggleReminder(r: Reminder) {
    setReminders(p => p.map(x => x.id === r.id ? { ...x, done: !x.done } : x));
    await remindersApi.update(r.id, { done: !r.done });
  }
  async function deleteReminder(id: string) {
    setReminders(p => p.filter(x => x.id !== id));
    await remindersApi.remove(id);
  }

  // Derived
  const fmtTimer = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const timerPct = timerWork ? timerSecs / (25 * 60) : timerSecs / (5 * 60);
  const semesters = [...new Set(grades.map(g => g.semester))];
  const semGrades = grades.filter(g => g.semester === semFilter);
  const semGPA = calcGPA(semGrades);
  const cumGPA = calcGPA(grades);
  const activeNote = notes.find(n => n.id === activeNoteId);
  const activeProj = projects.find(p => p.id === activeProjId);
  const pendingCount = assignments.filter(a => !a.done).length;
  const pendingReminders = reminders.filter(r => !r.done).length;
  const avgAttend = attendance.length ? Math.round(attendance.reduce((s, a) => s + (a.total ? a.attended / a.total : 0), 0) / attendance.length * 100) : 0;
  const nextExam = [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const P = { high: "text-red-400 bg-red-400/10", medium: "text-amber-400 bg-amber-400/10", low: "text-emerald-400 bg-emerald-400/10" };
  const RI = { assignment: CheckSquare, exam: AlertTriangle, study: Brain, event: Calendar };
  const RC = { assignment: "text-violet-400", exam: "text-red-400", study: "text-sky-400", event: "text-emerald-400" };
  const attPct = (a: AttendanceRecord) => a.total ? Math.round(a.attended / a.total * 100) : 0;
  const attColor = (p: number) => p >= 85 ? "text-emerald-400" : p >= 75 ? "text-amber-400" : "text-red-400";
  const attBar = (p: number) => p >= 85 ? "#10b981" : p >= 75 ? "#f59e0b" : "#ef4444";

  // ── Gamification: points, levels, badges, leaderboard ────────────────────
  const completedAssignmentsCount = assignments.filter(a => a.done).length;
  const doneRemindersCount = reminders.filter(r => r.done).length;
  const totalPoints =
    completedAssignmentsCount * 15 +
    doneRemindersCount * 10 +
    sessions * 20 +
    Math.round(cumGPA * 50) +
    Math.round(avgAttend * 1.5);
  const XP_PER_LEVEL = 200;
  const level = Math.floor(totalPoints / XP_PER_LEVEL) + 1;
  const xpIntoLevel = totalPoints % XP_PER_LEVEL;
  const xpPct = Math.min(100, Math.round((xpIntoLevel / XP_PER_LEVEL) * 100));

  const badgeDefs = [
    { id: "task-master", label: "Task Master", desc: "Complete 5+ assignments", icon: CheckSquare, color: "#7c3aed", earned: completedAssignmentsCount >= 5 },
    { id: "perfect-attendance", label: "Perfect Attendance", desc: "95%+ avg attendance", icon: BarChart3, color: "#10b981", earned: avgAttend >= 95 },
    { id: "focus-champion", label: "Focus Champion", desc: "10+ pomodoro sessions", icon: Timer, color: "#f59e0b", earned: sessions >= 10 },
    { id: "gpa-star", label: "GPA Star", desc: "Cumulative GPA 3.5+", icon: Award, color: "#ec4899", earned: cumGPA >= 3.5 },
    { id: "on-top-of-it", label: "On Top Of It", desc: "Clear 5+ reminders", icon: Bell, color: "#0ea5e9", earned: doneRemindersCount >= 5 },
    { id: "note-taker", label: "Note Taker", desc: "Keep 5+ notes", icon: FileText, color: "#8b5cf6", earned: notes.length >= 5 },
  ];
  const earnedBadgeCount = badgeDefs.filter(b => b.earned).length;

  // Illustrative classmate placeholders so the leaderboard layout has
  // something to show — not real people or backend-tracked data. Every
  // score starts at zero until real classmates/scores are wired up.
  const CLASSMATES = [
    { name: "Maya Chen", points: 0 },
    { name: "Jordan Lee", points: 0 },
    { name: "Priya Patel", points: 0 },
    { name: "Sam Okafor", points: 0 },
    { name: "Alex Rivera", points: 0 },
    { name: "Riley Kim", points: 0 },
  ];
  const leaderboard = [...CLASSMATES.map(c => ({ ...c, isYou: false })), { name: user?.name || "You", points: totalPoints, isYou: true }]
    .sort((a, b) => b.points - a.points);
  const myRank = leaderboard.findIndex(p => p.isYou) + 1;

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-sm text-muted-foreground">Loading your data…</p>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard" as Section, label: "Dashboard", icon: LayoutDashboard },
    { id: "assignments" as Section, label: "Assignments", icon: CheckSquare, badge: pendingCount },
    { id: "exams" as Section, label: "Exam Countdown", icon: AlertTriangle },
    { id: "attendance" as Section, label: "Attendance", icon: BarChart3 },
    { id: "notes" as Section, label: "Notes", icon: FileText },
    { id: "timetable" as Section, label: "Timetable", icon: Calendar },
    { id: "timer" as Section, label: "Study Timer", icon: Timer },
    { id: "projects" as Section, label: "Group Projects", icon: Users },
    { id: "planner" as Section, label: "AI Planner", icon: Brain },
    { id: "gpa" as Section, label: "GPA Calculator", icon: GraduationCap },
    { id: "reminders" as Section, label: "Reminders", icon: Bell, badge: pendingReminders },
    { id: "rewards" as Section, label: "Rewards", icon: Trophy },
  ];

  const showLabels = !collapsed || mobileNavOpen;
  const sidebarWidth = collapsed && !mobileNavOpen ? 60 : 232;

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ── Mobile backdrop ── */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        style={{ width: sidebarWidth }}
        className={`fixed md:static inset-y-0 left-0 z-40 transition-all duration-300 bg-[#0a0a18] border-r border-border flex flex-col shrink-0 overflow-hidden transform
          ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex items-center gap-3 px-3 h-14 border-b border-border shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <GraduationCap size={15} className="text-white" />
          </div>
          {showLabels && (
            <span className="font-bold text-sm tracking-tight text-foreground whitespace-nowrap">StudyOS</span>
          )}
          <button
            onClick={() => setMobileNavOpen(false)}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors shrink-0 md:hidden"
          >
            <X size={16} />
          </button>
          <button
            onClick={() => setCollapsed(c => !c)}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors shrink-0 hidden md:block"
          >
            <Menu size={15} />
          </button>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActive(item.id); setMobileNavOpen(false); }}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all relative group
                ${active === item.id ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"}`}
            >
              {active === item.id && <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-r" />}
              <item.icon size={15} className="shrink-0" />
              {showLabels && <span className="truncate text-[13px]">{item.label}</span>}
              {showLabels && (item as any).badge > 0 && (
                <span className="ml-auto text-[10px] bg-primary text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                  {(item as any).badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="border-t border-border p-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-sky-400 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
              {initials(user?.name || "You")}
            </div>
            {showLabels && (
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-foreground truncate">{user?.name}</p>
                <div className="flex items-center gap-1">
                  <Trophy size={9} className="text-amber-400 shrink-0" />
                  <p className="text-[11px] text-muted-foreground truncate">Lvl {level} · {totalPoints} XP</p>
                </div>
              </div>
            )}
            <button onClick={logout} title="Log out" className="text-muted-foreground hover:text-red-400 transition-colors shrink-0">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto bg-background min-w-0">
        {/* ── Mobile top bar ── */}
        <div className="md:hidden sticky top-0 z-20 flex items-center gap-3 h-14 px-4 border-b border-border bg-background/95 backdrop-blur shrink-0">
          <button onClick={() => setMobileNavOpen(true)} className="text-foreground shrink-0">
            <Menu size={20} />
          </button>
          <span className="font-bold text-sm text-foreground truncate">{navItems.find(n => n.id === active)?.label ?? "StudyOS"}</span>
          <div className="ml-auto flex items-center gap-1.5 text-amber-400 shrink-0">
            <Trophy size={13} />
            <span className="text-[12px] font-semibold">{level}</span>
          </div>
        </div>

        {/* ── DASHBOARD ── */}
        {active === "dashboard" && (
          <div className="p-4 sm:p-6 max-w-5xl mx-auto">
            {InfoBanner("dashboard")}
            <div className="mb-7">
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest mb-1">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
              <h1 className="text-2xl font-extrabold text-foreground">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {(user?.name || "there").split(" ")[0]}.</h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                {pendingCount} pending assignments{nextExam && <> · next exam in <span className="text-amber-400 font-medium">{daysUntil(nextExam.date)} days</span></>}
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
              {[
                { label: "Pending Tasks", value: String(pendingCount), icon: CheckSquare, color: "#7c3aed", sub: "assignments due" },
                { label: "Next Exam", value: nextExam ? `${daysUntil(nextExam.date)}d` : "—", icon: AlertTriangle, color: "#ef4444", sub: nextExam?.subject ?? "No exams yet" },
                { label: "Avg Attendance", value: `${avgAttend}%`, icon: BarChart3, color: "#10b981", sub: "across 6 subjects" },
                { label: "Cumulative GPA", value: cumGPA.toFixed(2), icon: Award, color: "#f59e0b", sub: "out of 4.00" },
              ].map(s => (
                <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{s.label}</span>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: s.color + "20" }}>
                      <s.icon size={13} style={{ color: s.color }} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Upcoming assignments */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-foreground">Upcoming Assignments</h2>
                  <button onClick={() => setActive("assignments")} className="text-[11px] text-primary hover:underline">View all</button>
                </div>
                <div className="space-y-3">
                  {assignments.filter(a => !a.done).slice(0, 4).map(a => (
                    <div key={a.id} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: SUB_COLORS[a.subject] ?? "#888" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-foreground truncate font-medium">{a.title}</p>
                        <p className="text-[11px] text-muted-foreground">{a.subject} · Due {fmtDate(a.dueDate)}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${P[a.priority]}`}>{a.priority}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's classes */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-foreground">Today — {todayName}</h2>
                  <button onClick={() => setActive("timetable")} className="text-[11px] text-primary hover:underline">Full timetable</button>
                </div>
                <div className="space-y-2.5">
                  {(timetableByDay.find(d => d.day === todayName)?.slots ?? timetableByDay[0].slots).map((slot, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[11px] text-muted-foreground font-mono w-10 shrink-0">{slot.time}</span>
                      <div className="flex-1 flex items-center gap-2.5 rounded-lg px-3 py-2.5 border-l-2" style={{ background: (SUB_COLORS[slot.subject] ?? "#888") + "12", borderLeftColor: SUB_COLORS[slot.subject] ?? "#888" }}>
                        <span className="text-[13px] font-semibold text-foreground">{slot.subject}</span>
                        <span className="text-[11px] text-muted-foreground ml-auto">{slot.room}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exam countdown mini */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-foreground">Exam Countdown</h2>
                  <button onClick={() => setActive("exams")} className="text-[11px] text-primary hover:underline">All exams</button>
                </div>
                <div className="space-y-3">
                  {[...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3).map(exam => {
                    const days = daysUntil(exam.date);
                    return (
                      <div key={exam.id} className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ background: exam.color + "18" }}>
                          <span className="text-sm font-bold leading-none" style={{ color: exam.color }}>{days}</span>
                          <span className="text-[9px] font-medium mt-0.5" style={{ color: exam.color }}>days</span>
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-foreground">{exam.subject}</p>
                          <p className="text-[11px] text-muted-foreground">{fmtDate(exam.date)} · {exam.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reminders */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-foreground">Reminders</h2>
                  <button onClick={() => setActive("reminders")} className="text-[11px] text-primary hover:underline">All</button>
                </div>
                <div className="space-y-3">
                  {reminders.filter(r => !r.done).slice(0, 4).map(r => {
                    const Icon = RI[r.type];
                    return (
                      <div key={r.id} className="flex items-center gap-3">
                        <Icon size={14} className={RC[r.type]} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-foreground font-medium truncate">{r.title}</p>
                          <p className="text-[11px] text-muted-foreground">{fmtDate(r.date)} at {r.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ASSIGNMENTS ── */}
        {active === "assignments" && (
          <div className="p-4 sm:p-6 max-w-3xl mx-auto">
            {InfoBanner("assignments")}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-foreground">Assignments</h1>
                <p className="text-[12px] text-muted-foreground mt-0.5">{pendingCount} pending · {assignments.filter(a => a.done).length} completed</p>
              </div>
              <button onClick={() => setShowNewAssign(s => !s)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                <Plus size={14} /> Add
              </button>
            </div>

            {showNewAssign && (
              <div className="bg-card border border-border rounded-xl p-5 mb-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">New Assignment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input className="col-span-2 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" placeholder="Assignment title…" value={newAssign.title} onChange={e => setNewAssign(a => ({ ...a, title: e.target.value }))} />
                  <select className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" value={newAssign.subject} onChange={e => setNewAssign(a => ({ ...a, subject: e.target.value }))}>
                    {Object.keys(SUB_COLORS).map(s => <option key={s}>{s}</option>)}
                  </select>
                  <input type="date" className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" value={newAssign.dueDate} onChange={e => setNewAssign(a => ({ ...a, dueDate: e.target.value }))} />
                  <select className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" value={newAssign.priority} onChange={e => setNewAssign(a => ({ ...a, priority: e.target.value as Priority }))}>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                  <select className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" value={newAssign.type} onChange={e => setNewAssign(a => ({ ...a, type: e.target.value }))}>
                    {["Homework", "Essay", "Lab", "Presentation", "Case Study", "Reading", "Project"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={addAssignment} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90">Add</button>
                  <button onClick={() => setShowNewAssign(false)} className="px-4 py-2 text-muted-foreground text-sm hover:text-foreground">Cancel</button>
                </div>
              </div>
            )}

            <div className="flex gap-1 mb-5 bg-secondary/40 rounded-lg p-1 w-fit">
              {(["all", "pending", "done"] as const).map(f => (
                <button key={f} onClick={() => setAssignFilter(f)} className={`px-4 py-1.5 rounded-md text-[12px] font-semibold capitalize transition-all ${assignFilter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{f}</button>
              ))}
            </div>

            <div className="space-y-2">
              {assignments.filter(a => assignFilter === "all" ? true : assignFilter === "pending" ? !a.done : a.done).map(a => (
                <div key={a.id} className={`bg-card border border-border rounded-xl p-4 flex items-center gap-3.5 transition-opacity ${a.done ? "opacity-55" : ""}`}>
                  <button onClick={() => toggleAssignment(a)} className="shrink-0">
                    {a.done ? <CheckCircle2 size={18} className="text-emerald-400" /> : <div className="w-[18px] h-[18px] rounded-full border-2 border-border hover:border-primary transition-colors" />}
                  </button>
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: SUB_COLORS[a.subject] ?? "#888" }} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-medium ${a.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{a.title}</p>
                    <p className="text-[11px] text-muted-foreground">{a.subject} · {a.type} · Due {fmtDate(a.dueDate)}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${P[a.priority]}`}>{a.priority}</span>
                  <span className="text-[11px] text-muted-foreground shrink-0 font-mono">{daysUntil(a.dueDate)}d</span>
                  <button onClick={() => deleteAssignment(a.id)} className="text-muted-foreground hover:text-red-400 transition-colors shrink-0 ml-1"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EXAM COUNTDOWN ── */}
        {active === "exams" && (
          <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            {InfoBanner("exams")}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-foreground">Exam Countdown</h1>
                <p className="text-[12px] text-muted-foreground mt-0.5">{exams.length} upcoming exams this semester</p>
              </div>
              <button onClick={() => setShowNewExam(s => !s)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"><Plus size={14} />Add</button>
            </div>
            {showNewExam && (
              <div className="bg-card border border-border rounded-xl p-5 mb-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" value={newExam.subject} onChange={e => setNewExam(x => ({ ...x, subject: e.target.value, color: SUB_COLORS[e.target.value] ?? "#7c3aed" }))}>
                    {Object.keys(SUB_COLORS).map(s => <option key={s}>{s}</option>)}
                  </select>
                  <input className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" placeholder="Room / hall" value={newExam.room} onChange={e => setNewExam(x => ({ ...x, room: e.target.value }))} />
                  <input type="date" className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" value={newExam.date} onChange={e => setNewExam(x => ({ ...x, date: e.target.value }))} />
                  <input type="time" className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" value={newExam.time} onChange={e => setNewExam(x => ({ ...x, time: e.target.value }))} />
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={addExam} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90">Add Exam</button>
                  <button onClick={() => setShowNewExam(false)} className="px-4 py-2 text-muted-foreground text-sm hover:text-foreground">Cancel</button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exams.map(exam => {
                const days = daysUntil(exam.date);
                const urgencyLabel = days <= 0 ? "TODAY" : days === 1 ? "TOMORROW" : `${days} DAYS`;
                const urgencyColor = days <= 7 ? "#ef4444" : days <= 14 ? "#f59e0b" : "#10b981";
                return (
                  <div key={exam.id} className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-[0.06]" style={{ background: exam.color }} />
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-3 h-3 rounded-full mt-0.5" style={{ background: exam.color }} />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-widest" style={{ color: urgencyColor }}>{urgencyLabel}</span>
                        <button onClick={() => deleteExam(exam.id)} className="text-muted-foreground hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-0.5">{exam.subject}</h3>
                    <p className="text-[11px] text-muted-foreground mb-5">{exam.room}</p>
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-bold" style={{ fontFamily: "'DM Mono', monospace", color: exam.color }}>{days}</span>
                      <span className="text-sm text-muted-foreground pb-1.5">days left</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{fmtDate(exam.date)}</span>
                      <span>{exam.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ATTENDANCE ── */}
        {active === "attendance" && (
          <div className="p-4 sm:p-6 max-w-3xl mx-auto">
            {InfoBanner("attendance")}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-foreground">Attendance Tracker</h1>
              <p className="text-[12px] text-muted-foreground mt-0.5">Minimum 75% required · P = Present, A = Absent</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 mb-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">Overview</h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={attendance.map(a => ({ name: a.subject.split(" ")[0], pct: attPct(a), fill: a.color }))} barSize={26}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#5a5a80" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#5a5a80" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0d0d1c", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "8px", fontSize: "11px", color: "#e2e2f0" }} formatter={(v: number) => [`${v}%`, "Attendance"]} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="pct" radius={[4, 4, 0, 0]}>{attendance.map((a, i) => <Cell key={i} fill={a.color} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {attendance.map(a => {
                const pct = attPct(a);
                return (
                  <div key={a.subject} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />
                        <span className="text-[13px] font-semibold text-foreground">{a.subject}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${attColor(pct)}`}>{pct}%</span>
                        <span className="text-[11px] text-muted-foreground">{a.attended}/{a.total}</span>
                        <button onClick={() => markAttendance(a, true)} className="w-6 h-6 rounded bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 flex items-center justify-center text-[10px] font-bold transition-colors">P</button>
                        <button onClick={() => markAttendance(a, false)} className="w-6 h-6 rounded bg-red-400/10 text-red-400 hover:bg-red-400/20 flex items-center justify-center text-[10px] font-bold transition-colors">A</button>
                      </div>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: attBar(pct) }} />
                    </div>
                    {pct < 75 && <p className="text-[11px] text-red-400 mt-1.5">⚠ Below minimum attendance threshold</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── NOTES ── */}
        {active === "notes" && (
          <div className="flex flex-col md:h-full">
            {!seenInfo.notes && <div className="px-4 pt-4">{InfoBanner("notes")}</div>}
            <div className="flex flex-col md:flex-row flex-1 min-h-0">
            <div className="w-full md:w-64 md:shrink-0 border-b md:border-b-0 md:border-r border-border overflow-y-auto bg-[#0a0a18] max-h-56 md:max-h-none">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-[12px] font-semibold text-foreground">Notes</span>
                <button onClick={addNote} className="w-6 h-6 flex items-center justify-center rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"><Plus size={12} /></button>
              </div>
              <div className="p-2 space-y-0.5">
                {[...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map(note => (
                  <button key={note.id} onClick={() => setActiveNoteId(note.id)} className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${activeNoteId === note.id ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary/60 border border-transparent"}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      {note.pinned && <Star size={9} className="text-amber-400 fill-amber-400 shrink-0" />}
                      <span className="text-[12px] font-medium text-foreground truncate">{note.title}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded truncate" style={{ background: (SUB_COLORS[note.subject] ?? "#888") + "20", color: SUB_COLORS[note.subject] ?? "#888" }}>{note.subject.split(" ")[0]}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{fmtDate(note.date)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {activeNote && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                <div className="max-w-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] px-2.5 py-1 rounded-full font-medium" style={{ background: (SUB_COLORS[activeNote.subject] ?? "#888") + "20", color: SUB_COLORS[activeNote.subject] ?? "#888" }}>{activeNote.subject}</span>
                    <div className="flex gap-1">
                      <button onClick={() => togglePinNote(activeNote)} className={`p-1.5 rounded-md hover:bg-secondary/60 transition-colors ${activeNote.pinned ? "text-amber-400" : "text-muted-foreground"}`}><Star size={14} className={activeNote.pinned ? "fill-current" : ""} /></button>
                      <button onClick={() => deleteNote(activeNote.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <input className="w-full text-xl font-bold text-foreground bg-transparent border-none focus:outline-none mb-1" value={activeNote.title} onChange={e => updateNoteLocal(activeNote.id, { title: e.target.value })} onBlur={e => saveNote(activeNote.id, { title: e.target.value })} />
                  <p className="text-[11px] text-muted-foreground mb-7">{fmtDate(activeNote.date)}</p>
                  <textarea className="w-full min-h-[420px] bg-transparent text-[13px] text-foreground/90 leading-relaxed focus:outline-none resize-none placeholder:text-muted-foreground" value={activeNote.content} onChange={e => updateNoteLocal(activeNote.id, { content: e.target.value })} onBlur={e => saveNote(activeNote.id, { content: e.target.value })} placeholder="Start typing your notes…" />
                </div>
              </div>
            )}
            </div>
          </div>
        )}

        {/* ── TIMETABLE ── */}
        {active === "timetable" && (
          <div className="p-4 sm:p-6">
            {InfoBanner("timetable")}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-foreground">Weekly Timetable</h1>
              <p className="text-[12px] text-muted-foreground mt-0.5">Summer 2026 — Class Schedule</p>
            </div>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="grid grid-cols-5 gap-3 min-w-[700px]">
              {timetableByDay.map((day) => {
                const isToday = day.day === todayName;
                return (
                  <div key={day.day} className={`bg-card border rounded-xl overflow-hidden ${isToday ? "border-primary/30 ring-1 ring-primary/20" : "border-border"}`}>
                    <div className={`px-3 py-3 border-b border-border ${isToday ? "bg-primary/10" : ""}`}>
                      <h3 className={`text-[13px] font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>{day.day}</h3>
                      {isToday && <span className="text-[10px] text-primary/70 font-medium">Today</span>}
                    </div>
                    <div className="p-2.5 space-y-2">
                      {day.slots.map((slot) => (
                        <div key={slot.id} className="rounded-lg p-2.5 border-l-2" style={{ background: (SUB_COLORS[slot.subject] ?? "#888") + "10", borderLeftColor: SUB_COLORS[slot.subject] ?? "#888" }}>
                          <p className="text-[10px] font-mono text-muted-foreground mb-0.5">{slot.time}–{slot.end}</p>
                          <p className="text-[12px] font-semibold text-foreground leading-tight">{slot.subject}</p>
                          <p className="text-[10px] text-muted-foreground">{slot.room}</p>
                          <span className="text-[9px] px-1.5 py-0.5 rounded mt-1 inline-block font-medium" style={{ background: (SUB_COLORS[slot.subject] ?? "#888") + "22", color: SUB_COLORS[slot.subject] ?? "#888" }}>{slot.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          </div>
        )}

        {/* ── STUDY TIMER ── */}
        {active === "timer" && (
          <div className="p-4 sm:p-6 max-w-xl mx-auto">
            {InfoBanner("timer")}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-foreground">Study Timer</h1>
              <p className="text-[12px] text-muted-foreground mt-0.5">Pomodoro technique · 25 min focus, 5 min break</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center mb-5">
              <div className="flex gap-2 mb-8">
                {[{ label: "Focus", work: true, color: "#7c3aed" }, { label: "Short Break", work: false, color: "#10b981" }].map(m => (
                  <button key={m.label} onClick={() => { setTimerRunning(false); setTimerWork(m.work); setTimerSecs(m.work ? 25 * 60 : 5 * 60); }} className="px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all" style={timerWork === m.work ? { background: m.color, color: "#fff" } : { color: "#5a5a80" }}>
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="relative w-48 h-48 mb-8">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="3" fill="none" className="text-secondary" />
                  <circle cx="50" cy="50" r="44" stroke={timerWork ? "#7c3aed" : "#10b981"} strokeWidth="3.5" fill="none" strokeDasharray="276.46" strokeDashoffset={276.46 * (1 - timerPct)} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{fmtTimer(timerSecs)}</span>
                  <span className="text-[11px] text-muted-foreground mt-1">{timerWork ? "Focus time" : "Break time"}</span>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <button onClick={() => { setTimerRunning(false); setTimerSecs(timerWork ? 25 * 60 : 5 * 60); }} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"><RotateCcw size={15} /></button>
                <button onClick={() => setTimerRunning(r => !r)} className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95" style={{ background: timerWork ? "#7c3aed" : "#10b981", boxShadow: `0 0 24px ${timerWork ? "#7c3aed" : "#10b981"}40` }}>
                  {timerRunning ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <div className="w-10 h-10" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Sessions today", value: sessions },
                { label: "Focus time", value: `${sessions * 25}m` },
                { label: "Long breaks earned", value: Math.floor(sessions / 4) },
              ].map(s => (
                <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="flex gap-3">
                <Zap size={15} className="text-primary mt-0.5 shrink-0" />
                <p className="text-[12px] text-muted-foreground leading-relaxed">After 4 focus sessions, take a 15–30 minute long break. Your brain needs deeper rest to consolidate everything you've studied.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── GROUP PROJECTS ── */}
        {active === "projects" && (
          <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            {InfoBanner("projects")}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-foreground">Group Projects</h1>
              <p className="text-[12px] text-muted-foreground mt-0.5">{projects.length} active projects</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {projects.map(p => (
                <button key={p.id} onClick={() => setActiveProjId(p.id)} className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all border ${activeProjId === p.id ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"}`}>{p.name}</button>
              ))}
            </div>
            {activeProj && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-[13px] font-semibold text-foreground mb-4">{activeProj.name}</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider">Subject</p>
                        <span className="text-[11px] px-2.5 py-1 rounded-full font-medium" style={{ background: (SUB_COLORS[activeProj.subject] ?? "#888") + "20", color: SUB_COLORS[activeProj.subject] ?? "#888" }}>{activeProj.subject}</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Deadline</p>
                        <p className="text-[13px] text-foreground font-semibold">{fmtDate(activeProj.deadline)}</p>
                        <p className="text-[11px] text-amber-400">{daysUntil(activeProj.deadline)} days remaining</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Progress</p>
                          <span className="text-[11px] text-primary font-semibold">{activeProj.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full">
                          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${activeProj.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Team</p>
                    <div className="space-y-2.5">
                      {activeProj.members.map(m => (
                        <div key={m} className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-sky-400 flex items-center justify-center text-white text-[10px] font-bold">{initials(m)}</div>
                          <span className="text-[13px] text-foreground">{m}</span>
                          {m === "You" && <span className="text-[10px] text-muted-foreground ml-auto">you</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-foreground">Tasks</h3>
                    <span className="text-[11px] text-muted-foreground">{activeProj.tasks.filter(t => t.done).length}/{activeProj.tasks.length} complete</span>
                  </div>
                  <div className="space-y-2">
                    {activeProj.tasks.map(task => (
                      <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${task.done ? "border-border/40 bg-secondary/10" : "border-border bg-secondary/30"}`}>
                        <button onClick={() => toggleProjectTask(activeProjId, task.id, task.done)} className="shrink-0">
                          {task.done ? <CheckCircle2 size={16} className="text-emerald-400" /> : <div className="w-4 h-4 rounded border-2 border-border hover:border-primary transition-colors" />}
                        </button>
                        <p className={`flex-1 text-[13px] ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-sky-400 flex items-center justify-center text-[8px] text-white font-bold">{task.assignee[0]}</div>
                          <span className="text-[11px] text-muted-foreground">{task.assignee}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── AI STUDY PLANNER ── */}
        {active === "planner" && (
          <div className="p-4 sm:p-6 max-w-5xl mx-auto">
            {InfoBanner("planner")}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"><Brain size={12} className="text-white" /></div>
                <h1 className="text-xl font-bold text-foreground">AI Study Planner</h1>
              </div>
              <p className="text-[12px] text-muted-foreground">Personalised schedule based on your exam dates and assignment deadlines</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
              <div className="lg:col-span-2 bg-primary/5 border border-primary/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">AI Recommendation</span>
                </div>
                <p className="text-[13px] text-foreground leading-relaxed mb-2">
                  {pendingCount > 0
                    ? <>You have <strong>{pendingCount} pending assignment{pendingCount === 1 ? "" : "s"}</strong>{nextExam && <> and your next exam (<strong>{nextExam.subject}</strong>) is in {daysUntil(nextExam.date)} days</>}. The plan below prioritizes the most urgent items first.</>
                    : "You're all caught up on assignments. The schedule below is built from your upcoming exams."}
                </p>
                <p className="text-[11px] text-muted-foreground">{plannerNote}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recommended hrs/week</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={STUDY_HOURS} dataKey="hours" nameKey="name" cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={2}>
                      {STUDY_HOURS.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0d0d1c", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "8px", fontSize: "11px", color: "#e2e2f0" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
                  {STUDY_HOURS.map(s => (
                    <div key={s.name} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.fill }} />
                      <span className="text-[10px] text-muted-foreground">{s.name} {s.hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <h2 className="text-[13px] font-semibold text-foreground">This Week</h2>
              </div>
              <div className="divide-y divide-border">
                {aiPlan.filter(day => day.sessions.length > 0).map(day => (
                  <div key={day.day} className="p-4">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">{day.day}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {day.sessions.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 bg-secondary/30 rounded-lg p-3">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: SUB_COLORS[s.subject] ?? "#888" }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-foreground">{s.topic}</p>
                            <p className="text-[10px] text-muted-foreground">{s.subject} · {s.time}</p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${s.intensity === "High" ? "bg-red-400/10 text-red-400" : s.intensity === "Medium" ? "bg-amber-400/10 text-amber-400" : "bg-emerald-400/10 text-emerald-400"}`}>{s.intensity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── GPA CALCULATOR ── */}
        {active === "gpa" && (
          <div className="p-4 sm:p-6 max-w-3xl mx-auto">
            {InfoBanner("gpa")}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-foreground">GPA Calculator</h1>
              <p className="text-[12px] text-muted-foreground mt-0.5">Track your academic performance across semesters</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: "Semester GPA", value: semGPA, sub: semFilter },
                { label: "Cumulative GPA", value: cumGPA, sub: "All semesters" },
              ].map(g => {
                const c = g.value >= 3.5 ? "#10b981" : g.value >= 3.0 ? "#7c3aed" : g.value >= 2.0 ? "#f59e0b" : "#ef4444";
                return (
                  <div key={g.label} className="bg-card border border-border rounded-xl p-6 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">{g.label}</p>
                    <p className="text-5xl font-bold" style={{ fontFamily: "'DM Mono', monospace", color: c }}>{g.value.toFixed(2)}</p>
                    <p className="text-[11px] text-muted-foreground mt-2">{g.sub}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {semesters.map(sem => (
                <button key={sem} onClick={() => setSemFilter(sem)} className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all border ${semFilter === sem ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>{sem}</button>
              ))}
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden mb-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Subject</th>
                    <th className="text-center px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Credits</th>
                    <th className="text-center px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Grade</th>
                    <th className="text-center px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Points</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {semGrades.map(g => (
                    <tr key={g.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-3 text-[13px] text-foreground">{g.subject}</td>
                      <td className="px-4 py-3 text-[13px] text-muted-foreground text-center">{g.credits}</td>
                      <td className="px-4 py-3 text-center">
                        <select className="bg-secondary border border-border rounded px-2 py-1 text-[12px] text-foreground focus:outline-none focus:border-primary" value={g.grade} onChange={e => updateGradeLetter(g.id, e.target.value)}>
                          {Object.keys(GRADE_PTS).map(gr => <option key={gr}>{gr}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center"><span className="text-[13px] font-mono font-bold text-primary">{(GRADE_PTS[g.grade] ?? 0).toFixed(1)}</span></td>
                      <td className="px-4 py-3 text-right"><button onClick={() => deleteGrade(g.id)} className="text-muted-foreground hover:text-red-400 transition-colors"><Trash2 size={12} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {showNewGrade ? (
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <input className="col-span-2 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" placeholder="Subject name" value={newGrade.subject} onChange={e => setNewGrade(g => ({ ...g, subject: e.target.value }))} />
                  <select className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" value={newGrade.credits} onChange={e => setNewGrade(g => ({ ...g, credits: e.target.value }))}>
                    {[1, 2, 3, 4, 5, 6].map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" value={newGrade.grade} onChange={e => setNewGrade(g => ({ ...g, grade: e.target.value }))}>
                    {Object.keys(GRADE_PTS).map(gr => <option key={gr}>{gr}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={addGrade} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90">Add Course</button>
                  <button onClick={() => setShowNewGrade(false)} className="px-4 py-2 text-muted-foreground text-sm hover:text-foreground">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowNewGrade(true)} className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"><Plus size={13} />Add course</button>
            )}
          </div>
        )}

        {/* ── REMINDERS ── */}
        {active === "reminders" && (
          <div className="p-4 sm:p-6 max-w-2xl mx-auto">
            {InfoBanner("reminders")}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-foreground">Reminders</h1>
                <p className="text-[12px] text-muted-foreground mt-0.5">{pendingReminders} upcoming</p>
              </div>
              <button onClick={() => setShowNewRemind(s => !s)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"><Plus size={14} />Add</button>
            </div>
            {showNewRemind && (
              <div className="bg-card border border-border rounded-xl p-5 mb-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input className="col-span-2 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" placeholder="Reminder title…" value={newRemind.title} onChange={e => setNewRemind(r => ({ ...r, title: e.target.value }))} />
                  <input type="date" className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" value={newRemind.date} onChange={e => setNewRemind(r => ({ ...r, date: e.target.value }))} />
                  <input type="time" className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" value={newRemind.time} onChange={e => setNewRemind(r => ({ ...r, time: e.target.value }))} />
                  <select className="col-span-2 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" value={newRemind.type} onChange={e => setNewRemind(r => ({ ...r, type: e.target.value as Reminder["type"] }))}>
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                    <option value="study">Study Session</option>
                    <option value="event">Event</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={addReminder} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90">Set Reminder</button>
                  <button onClick={() => setShowNewRemind(false)} className="px-4 py-2 text-muted-foreground text-sm hover:text-foreground">Cancel</button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {[...reminders].sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()).map(r => {
                const Icon = RI[r.type];
                return (
                  <div key={r.id} className={`bg-card border border-border rounded-xl p-4 flex items-center gap-4 transition-all ${r.done ? "opacity-50" : ""}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${r.done ? "bg-secondary" : "bg-primary/10"}`}>
                      <Icon size={14} className={r.done ? "text-muted-foreground" : RC[r.type]} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-medium ${r.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{r.title}</p>
                      <p className="text-[11px] text-muted-foreground">{fmtDate(r.date)} at {r.time}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => toggleReminder(r)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${r.done ? "bg-secondary text-muted-foreground" : "bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20"}`}><CheckCircle2 size={13} /></button>
                      <button onClick={() => deleteReminder(r.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── REWARDS & LEADERBOARD ── */}
        {active === "rewards" && (
          <div className="p-4 sm:p-6 max-w-5xl mx-auto">
            {InfoBanner("rewards")}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Trophy size={18} className="text-amber-400" /> Rewards & Leaderboard
              </h1>
              <p className="text-[12px] text-muted-foreground mt-0.5">Earn XP for staying on top of your work</p>
            </div>

            {/* Level card */}
            <div className="bg-gradient-to-br from-violet-600/15 to-sky-500/10 border border-primary/20 rounded-xl p-5 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0">
                    <Sparkles size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Level</p>
                    <p className="text-3xl font-bold text-foreground leading-none">{level}</p>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                    <span>{xpIntoLevel} XP</span>
                    <span>{XP_PER_LEVEL} XP to level {level + 1}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-sky-400 rounded-full transition-all duration-500" style={{ width: `${xpPct}%` }} />
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <p className="text-2xl font-bold text-primary leading-none">{totalPoints}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Total XP</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Badges */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-foreground">Badges</h2>
                  <span className="text-[11px] text-muted-foreground">{earnedBadgeCount}/{badgeDefs.length} earned</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {badgeDefs.map(b => (
                    <div key={b.id} className={`flex flex-col items-center text-center gap-1.5 rounded-xl p-3 border transition-all ${b.earned ? "border-border bg-secondary/30" : "border-border/40 bg-secondary/10 opacity-40"}`}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: b.color + "20" }}>
                        <b.icon size={16} style={{ color: b.color }} />
                      </div>
                      <p className="text-[11px] font-semibold text-foreground leading-tight">{b.label}</p>
                      <p className="text-[9px] text-muted-foreground leading-tight">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-foreground">Class Leaderboard</h2>
                  <span className="text-[11px] text-muted-foreground">You're #{myRank}</span>
                </div>
                <div className="space-y-2">
                  {leaderboard.map((p, i) => {
                    const rankColor = i === 0 ? "#f59e0b" : i === 1 ? "#9ca3af" : i === 2 ? "#b45309" : undefined;
                    return (
                      <div key={p.name} className={`flex items-center gap-3 rounded-lg p-2.5 transition-all ${p.isYou ? "bg-primary/10 border border-primary/30" : "border border-transparent"}`}>
                        <div className="w-6 text-center shrink-0">
                          {i < 3 ? <Crown size={14} style={{ color: rankColor }} /> : <span className="text-[11px] text-muted-foreground font-mono">{i + 1}</span>}
                        </div>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-sky-400 flex items-center justify-center text-white text-[10px] font-bold shrink-0">{initials(p.name)}</div>
                        <span className={`flex-1 min-w-0 truncate text-[13px] ${p.isYou ? "text-primary font-semibold" : "text-foreground"}`}>{p.isYou ? "You" : p.name}</span>
                        <span className="text-[12px] font-mono font-bold text-muted-foreground shrink-0">{p.points} XP</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">Classmate scores are illustrative — for fun and friendly competition.</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
