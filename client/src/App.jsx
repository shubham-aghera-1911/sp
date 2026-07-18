import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Assignments from './pages/Assignments';
import './styles/global.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loader"></div>;
  }

  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Placeholder routes for other features */}
          <Route
            path="/assignments"
            element={
              <PrivateRoute>
                <Layout>
                  <Assignments />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/exams"
            element={
              <PrivateRoute>
                <Layout>
                  <div style={{ padding: '2rem' }}>
                    <h1>Exams</h1>
                    <p>Exams module coming soon...</p>
                  </div>
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <PrivateRoute>
                <Layout>
                  <div style={{ padding: '2rem' }}>
                    <h1>Attendance</h1>
                    <p>Attendance module coming soon...</p>
                  </div>
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/notes"
            element={
              <PrivateRoute>
                <Layout>
                  <div style={{ padding: '2rem' }}>
                    <h1>Notes</h1>
                    <p>Notes module coming soon...</p>
                  </div>
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/timetable"
            element={
              <PrivateRoute>
                <Layout>
                  <div style={{ padding: '2rem' }}>
                    <h1>Timetable</h1>
                    <p>Timetable module coming soon...</p>
                  </div>
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/projects"
            element={
              <PrivateRoute>
                <Layout>
                  <div style={{ padding: '2rem' }}>
                    <h1>Group Projects</h1>
                    <p>Projects module coming soon...</p>
                  </div>
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/study-timer"
            element={
              <PrivateRoute>
                <Layout>
                  <div style={{ padding: '2rem' }}>
                    <h1>Study Timer</h1>
                    <p>Study Timer module coming soon...</p>
                  </div>
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/gpa-calculator"
            element={
              <PrivateRoute>
                <Layout>
                  <div style={{ padding: '2rem' }}>
                    <h1>GPA Calculator</h1>
                    <p>GPA Calculator module coming soon...</p>
                  </div>
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/ai-planner"
            element={
              <PrivateRoute>
                <Layout>
                  <div style={{ padding: '2rem' }}>
                    <h1>AI Study Planner</h1>
                    <p>AI Study Planner module coming soon...</p>
                  </div>
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Layout>
                  <div style={{ padding: '2rem' }}>
                    <h1>Settings</h1>
                    <p>Settings module coming soon...</p>
                  </div>
                </Layout>
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
