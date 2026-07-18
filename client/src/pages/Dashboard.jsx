import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { examAPI, assignmentAPI, attendanceAPI } from '../utils/api';
import { Calendar, BookOpen, FileText, AlertCircle } from 'lucide-react';
import { format, formatDistance } from 'date-fns';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      const [examsRes, assignmentsRes, attendanceRes] = await Promise.all([
        examAPI.getAll(token),
        assignmentAPI.getAll(token, { status: 'Pending' }),
        attendanceAPI.getStats(token),
      ]);

      // Filter upcoming exams (next 7 days)
      const now = new Date();
      const upcoming = examsRes.data.filter((exam) => {
        const examDate = new Date(exam.examDate);
        return examDate > now && examDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      });

      setUpcomingExams(upcoming.slice(0, 5));
      setPendingAssignments(assignmentsRes.data.slice(0, 5));
      setAttendanceStats(attendanceRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name}!</p>
      </div>

      <div className="dashboard-grid">
        {/* Upcoming Exams */}
        <div className="dashboard-card">
          <div className="card-header">
            <Calendar size={24} />
            <h2>Upcoming Exams</h2>
          </div>
          <div className="card-content">
            {upcomingExams.length > 0 ? (
              <ul className="exam-list">
                {upcomingExams.map((exam) => (
                  <li key={exam._id} className="exam-item">
                    <div className="exam-info">
                      <h4>{exam.subject}</h4>
                      <p className="exam-type">{exam.examType}</p>
                      <p className="exam-date">
                        {format(new Date(exam.examDate), 'MMM dd, yyyy')} • {exam.examTime}
                      </p>
                    </div>
                    <div className="exam-countdown">
                      <span className="countdown-badge">{exam.daysLeft} days</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">No upcoming exams</p>
            )}
          </div>
        </div>

        {/* Pending Assignments */}
        <div className="dashboard-card">
          <div className="card-header">
            <FileText size={24} />
            <h2>Pending Assignments</h2>
          </div>
          <div className="card-content">
            {pendingAssignments.length > 0 ? (
              <ul className="assignment-list">
                {pendingAssignments.map((assignment) => (
                  <li key={assignment._id} className="assignment-item">
                    <div className="assignment-info">
                      <h4>{assignment.title}</h4>
                      <p className="assignment-subject">{assignment.subject}</p>
                      <p className="due-date">
                        Due: {format(new Date(assignment.dueDate), 'MMM dd')}
                      </p>
                    </div>
                    <span className={`priority priority-${assignment.priority}`}>
                      {assignment.priority}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">No pending assignments</p>
            )}
          </div>
        </div>

        {/* Attendance Overview */}
        <div className="dashboard-card">
          <div className="card-header">
            <AlertCircle size={24} />
            <h2>Attendance Overview</h2>
          </div>
          <div className="card-content">
            {attendanceStats && attendanceStats.length > 0 ? (
              <ul className="attendance-list">
                {attendanceStats.slice(0, 5).map((stat) => (
                  <li key={stat.subject} className="attendance-item">
                    <div className="attendance-info">
                      <h4>{stat.subject}</h4>
                      <div className="attendance-bar">
                        <div
                          className="attendance-filled"
                          style={{ width: `${stat.presentPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="percentage">{stat.presentPercentage}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">No attendance records</p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="dashboard-card">
          <div className="card-header">
            <BookOpen size={24} />
            <h2>Quick Stats</h2>
          </div>
          <div className="card-content">
            <div className="stats-grid">
              <div className="stat">
                <span className="stat-value">{upcomingExams.length}</span>
                <span className="stat-label">Upcoming Exams</span>
              </div>
              <div className="stat">
                <span className="stat-value">{pendingAssignments.length}</span>
                <span className="stat-label">Pending Tasks</span>
              </div>
              <div className="stat">
                <span className="stat-value">{user?.cgpa?.toFixed(2) || 'N/A'}</span>
                <span className="stat-label">CGPA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
