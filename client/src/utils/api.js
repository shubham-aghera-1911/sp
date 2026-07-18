import axios from 'axios';

export const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// Assignment APIs
export const assignmentAPI = {
  create: (data, token) => axios.post('/api/assignments', data, getConfig(token)),
  getAll: (token, filters = {}) =>
    axios.get('/api/assignments', { params: filters, headers: getConfig(token).headers }),
  getById: (id, token) => axios.get(`/api/assignments/${id}`, getConfig(token)),
  update: (id, data, token) => axios.put(`/api/assignments/${id}`, data, getConfig(token)),
  delete: (id, token) => axios.delete(`/api/assignments/${id}`, getConfig(token)),
};

// Exam APIs
export const examAPI = {
  create: (data, token) => axios.post('/api/exams', data, getConfig(token)),
  getAll: (token) => axios.get('/api/exams', getConfig(token)),
  getById: (id, token) => axios.get(`/api/exams/${id}`, getConfig(token)),
  update: (id, data, token) => axios.put(`/api/exams/${id}`, data, getConfig(token)),
  delete: (id, token) => axios.delete(`/api/exams/${id}`, getConfig(token)),
};

// Attendance APIs
export const attendanceAPI = {
  mark: (data, token) => axios.post('/api/attendance', data, getConfig(token)),
  getAll: (token) => axios.get('/api/attendance', getConfig(token)),
  getStats: (token) => axios.get('/api/attendance/stats/summary', getConfig(token)),
  update: (id, data, token) => axios.put(`/api/attendance/${id}`, data, getConfig(token)),
  delete: (id, token) => axios.delete(`/api/attendance/${id}`, getConfig(token)),
};

// Notes APIs
export const notesAPI = {
  create: (data, token) => axios.post('/api/notes', data, getConfig(token)),
  getAll: (token, filters = {}) =>
    axios.get('/api/notes', { params: filters, headers: getConfig(token).headers }),
  search: (query, token) => axios.get(`/api/notes/search/${query}`, getConfig(token)),
  getById: (id, token) => axios.get(`/api/notes/view/${id}`, getConfig(token)),
  update: (id, data, token) => axios.put(`/api/notes/${id}`, data, getConfig(token)),
  delete: (id, token) => axios.delete(`/api/notes/${id}`, getConfig(token)),
};

// Timetable APIs
export const timetableAPI = {
  create: (data, token) => axios.post('/api/timetable', data, getConfig(token)),
  getAll: (token, filters = {}) =>
    axios.get('/api/timetable', { params: filters, headers: getConfig(token).headers }),
  getToday: (token) => axios.get('/api/timetable/today', getConfig(token)),
  update: (id, data, token) => axios.put(`/api/timetable/${id}`, data, getConfig(token)),
  delete: (id, token) => axios.delete(`/api/timetable/${id}`, getConfig(token)),
};

// Project APIs
export const projectAPI = {
  create: (data, token) => axios.post('/api/projects', data, getConfig(token)),
  getAll: (token, filters = {}) =>
    axios.get('/api/projects', { params: filters, headers: getConfig(token).headers }),
  getById: (id, token) => axios.get(`/api/projects/${id}`, getConfig(token)),
  addMember: (id, data, token) => axios.post(`/api/projects/${id}/members`, data, getConfig(token)),
  update: (id, data, token) => axios.put(`/api/projects/${id}`, data, getConfig(token)),
  delete: (id, token) => axios.delete(`/api/projects/${id}`, getConfig(token)),
};
