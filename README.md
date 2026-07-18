# Student Productivity OS

A comprehensive MERN stack application designed specifically for college students to manage their academic life efficiently.

## Features

✅ **Assignment Tracker** - Track all assignments with due dates, priority levels, and status
✅ **Exam Countdown** - View upcoming exams with countdown timers
✅ **Attendance Tracker** - Monitor attendance for each subject with percentage calculations
✅ **Notes** - Create, organize, and search notes by subject and category
✅ **Timetable** - View your weekly class schedule with room numbers and instructors
✅ **Study Timer** - Pomodoro-style timer for focused study sessions
✅ **Group Project Management** - Collaborate with classmates on group projects
✅ **GPA Calculator** - Calculate your CGPA with ease
✅ **AI Study Planner** - Get AI-powered study recommendations (coming soon)
✅ **Reminder Notifications** - Notifications for upcoming deadlines and events

## Tech Stack

**Backend:**
- Node.js with Express.js
- MongoDB for data storage
- JWT for authentication
- Axios for API calls

**Frontend:**
- React 18 with Vite
- React Router for navigation
- Axios for API communication
- Lucide React for icons
- CSS3 for styling

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

## Installation

### 1. Clone or Extract the Project

```bash
cd student-productivity-os
```

### 2. Setup Backend

```bash
cd server

# Copy environment variables
cp .env.example .env

# Edit .env file with your MongoDB URI and JWT secret
nano .env
# Or edit with your preferred editor

# Install dependencies
npm install

# Start the server (development mode)
npm run dev
```

The backend server will run on `http://localhost:5000`

### 3. Setup Frontend

```bash
cd ../client

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Configuration

### Backend Environment Variables (.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student-productivity-os
JWT_SECRET=your-secret-key-here
NODE_ENV=development
OPENAI_API_KEY=your-openai-key-here (for AI planner)
```

### Frontend Configuration

The frontend automatically proxies API requests to `http://localhost:5000`. Update `client/vite.config.js` if your backend runs on a different port.

## Project Structure

```
student-productivity-os/
├── server/
│   ├── models/           # MongoDB schemas
│   │   ├── User.js
│   │   ├── Assignment.js
│   │   ├── Exam.js
│   │   ├── Attendance.js
│   │   ├── Note.js
│   │   ├── Timetable.js
│   │   └── Project.js
│   ├── routes/           # API endpoints
│   │   ├── auth.js
│   │   ├── assignments.js
│   │   ├── exams.js
│   │   ├── attendance.js
│   │   ├── notes.js
│   │   ├── timetable.js
│   │   └── projects.js
│   ├── middleware/       # Authentication middleware
│   ├── server.js         # Main server file
│   └── package.json
│
└── client/
    ├── src/
    │   ├── components/    # React components
    │   │   ├── Layout.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── Header.jsx
    │   ├── pages/         # Page components
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Dashboard.jsx
    │   ├── context/       # React context
    │   │   └── AuthContext.jsx
    │   ├── utils/         # Utility functions
    │   │   └── api.js
    │   ├── styles/        # CSS files
    │   ├── App.jsx        # Main app component
    │   └── main.jsx       # Entry point
    ├── vite.config.js
    ├── index.html
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/update` - Update user profile

### Assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/:id` - Get single assignment
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

### Exams
- `POST /api/exams` - Create exam
- `GET /api/exams` - Get all exams with countdown
- `GET /api/exams/:id` - Get single exam
- `PUT /api/exams/:id` - Update exam
- `DELETE /api/exams/:id` - Delete exam

### Attendance
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/stats/summary` - Get attendance statistics
- `PUT /api/attendance/:id` - Update attendance
- `DELETE /api/attendance/:id` - Delete attendance

### Notes
- `POST /api/notes` - Create note
- `GET /api/notes` - Get all notes
- `GET /api/notes/search/:query` - Search notes
- `GET /api/notes/view/:id` - Get single note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Timetable
- `POST /api/timetable` - Add class
- `GET /api/timetable` - Get full timetable
- `GET /api/timetable/today` - Get today's schedule
- `PUT /api/timetable/:id` - Update class
- `DELETE /api/timetable/:id` - Delete class

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects/:id/members` - Add member to project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## Features Roadmap

### Phase 1 (Completed)
- ✅ User authentication and registration
- ✅ Dashboard with overview
- ✅ Assignment tracking
- ✅ Exam management with countdown
- ✅ Attendance tracking
- ✅ Notes management
- ✅ Timetable management
- ✅ Group project management

### Phase 2 (In Progress)
- ⏳ Study Timer (Pomodoro)
- ⏳ GPA Calculator
- ⏳ Notifications and Reminders

### Phase 3 (Planned)
- ⏳ AI Study Planner integration
- ⏳ Performance analytics
- ⏳ Mobile app
- ⏳ Real-time notifications

## Usage

### Creating an Account

1. Navigate to the application at `http://localhost:3000`
2. Click on "Register" and fill in your details
3. Provide your roll number, department, and semester (optional but recommended)
4. Click Register

### Logging In

1. Enter your email and password on the login page
2. Click Login
3. You'll be redirected to the dashboard

### Adding Assignments

1. Click on "Assignments" in the sidebar
2. Click "Add Assignment"
3. Fill in the details (title, subject, due date, priority)
4. Click Save

### Marking Attendance

1. Go to "Attendance" section
2. Select a subject and date
3. Mark yourself as Present/Absent/Leave
4. View attendance statistics by subject

### Managing Timetable

1. Navigate to "Timetable"
2. Add your classes for each day
3. Include room number and instructor name
4. View your schedule organized by day

## Troubleshooting

### Backend won't start

**Error: MongoDB connection failed**
- Ensure MongoDB is running
- Check your MONGODB_URI in .env file
- For local MongoDB: `mongodb://localhost:27017/student-productivity-os`

**Error: Cannot find module**
- Run `npm install` in the server directory
- Clear node_modules and package-lock.json if needed

### Frontend won't start

**Error: Cannot find module**
- Run `npm install` in the client directory
- Clear node_modules and package-lock.json if needed

**Error: Port already in use**
- Edit `client/vite.config.js` and change the port number
- Or kill the process using the port: `lsof -i :3000` (macOS/Linux)

### API calls failing

**Error: 401 Unauthorized**
- Check if your JWT token is being sent correctly
- Clear localStorage and login again

**Error: CORS error**
- Ensure the backend is running on port 5000
- Check vite.config.js proxy settings

## Contributing

Feel free to fork this project and submit pull requests for any improvements.

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please create an issue in the repository or contact the development team.

---

**Happy Studying! 📚✨**
