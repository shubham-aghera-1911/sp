# Student Productivity OS - Complete Setup Guide

## Quick Start (5 minutes)

### Prerequisites
- Node.js v16+ and npm installed
- MongoDB (local or cloud MongoDB Atlas account)

### Step 1: Backend Setup

```bash
# Navigate to server directory
cd server

# Copy environment template
cp .env.example .env

# Edit .env file
# For local MongoDB use: mongodb://localhost:27017/student-productivity-os
# For MongoDB Atlas use: mongodb+srv://username:password@cluster.mongodb.net/student-productivity-os

# Generate a strong JWT secret (optional but recommended)
# macOS/Linux:
openssl rand -base64 32

# Windows PowerShell:
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((1..32 | ForEach-Object { [char](Get-Random -Minimum 33 -Maximum 127) } -join '')))

# Install dependencies
npm install

# Start backend server
npm run dev
# Server will run on http://localhost:5000
```

### Step 2: Frontend Setup (New Terminal)

```bash
# Navigate to client directory (from root)
cd client

# Install dependencies
npm install

# Start frontend
npm run dev
# App will run on http://localhost:3000
```

### Step 3: Access the App

1. Open browser and go to `http://localhost:3000`
2. Click "Register" to create a new account
3. Fill in your details and create an account
4. Login with your credentials
5. You're all set! Start using the app

---

## Detailed Setup Instructions

### Option A: Using Local MongoDB

#### Windows
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Run the installer
3. MongoDB will start automatically
4. In `.env` file, set: `MONGODB_URI=mongodb://localhost:27017/student-productivity-os`

#### macOS
```bash
# Install via Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Stop MongoDB
brew services stop mongodb-community
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
```

### Option B: Using MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Go to Database Access and create a user
4. Go to Network Access and add your IP address (or 0.0.0.0 for anywhere)
5. Click Connect and copy the connection string
6. Replace username and password in the connection string
7. Set in `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/student-productivity-os?retryWrites=true&w=majority
   ```

---

## Environment Configuration

### Server Environment Variables (.env)

```env
# Server Port
PORT=5000

# MongoDB Connection String
# Local: mongodb://localhost:27017/student-productivity-os
# Cloud: mongodb+srv://user:pass@cluster.mongodb.net/database?retryWrites=true&w=majority
MONGODB_URI=

# JWT Secret (generate secure random string)
JWT_SECRET=

# Node Environment
NODE_ENV=development

# Optional: OpenAI API Key for AI features (future use)
OPENAI_API_KEY=
```

### Frontend Configuration (vite.config.js)

Default proxy is set to `http://localhost:5000`. If your backend runs on a different port, update:

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:YOUR_PORT',
      changeOrigin: true,
    },
  },
}
```

---

## Project Setup Structure

```
student-productivity-os/
├── server/                 # Backend
│   ├── models/            # MongoDB schemas (User, Assignment, Exam, etc.)
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth middleware
│   ├── server.js          # Express app entry
│   ├── package.json
│   ├── .env              # (Create by copying .env.example)
│   └── node_modules/
│
├── client/                 # Frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context
│   │   ├── utils/         # Helper functions
│   │   ├── styles/        # CSS files
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js     # Vite configuration
│   ├── package.json
│   └── node_modules/
│
└── README.md              # Project documentation
```

---

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Runs on http://localhost:3000
```

### Production Build

**Frontend Build:**
```bash
cd client
npm run build
# Creates optimized build in dist/ folder
npm run preview
# Preview the production build
```

---

## Troubleshooting

### MongoDB Connection Issues

**Error: connect ECONNREFUSED 127.0.0.1:27017**
```bash
# Check if MongoDB is running
# Local MongoDB:
sudo systemctl status mongodb  # Linux
brew services list            # macOS

# Start MongoDB if not running
sudo systemctl start mongodb   # Linux
brew services start mongodb-community  # macOS
```

**Error: MongoAuthenticationError**
- Check username and password in MONGODB_URI
- Ensure database user has permissions
- For MongoDB Atlas: verify IP whitelist includes your machine

### Server Won't Start

**Error: port 5000 already in use**
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in .env
PORT=5001
```

**Error: Cannot find module**
```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

### Frontend Won't Load

**Error: Failed to connect to server**
- Ensure backend is running on port 5000
- Check proxy setting in `vite.config.js`
- Check browser console for CORS errors

**Error: port 3000 already in use**
```bash
# Use different port
npm run dev -- --port 3001
```

**Error: Cannot find module**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

### API Calls Failing

**Error: 401 Unauthorized**
- Token might have expired
- Clear localStorage and login again
- Check if JWT_SECRET is set correctly

**Error: CORS error**
- Backend not running
- Wrong proxy URL in vite.config.js
- Backend needs to start before frontend

---

## First Run Checklist

- [ ] Node.js v16+ installed
- [ ] MongoDB running locally or MongoDB Atlas connection ready
- [ ] `.env` file created with correct MONGODB_URI and JWT_SECRET
- [ ] Backend dependencies installed (`npm install` in server/)
- [ ] Frontend dependencies installed (`npm install` in client/)
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can register a new account
- [ ] Can login successfully
- [ ] Can see dashboard

---

## Database Seed (Optional)

To populate sample data, create `server/seed.js`:

```javascript
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Exam from './models/Exam.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Exam.deleteMany({});

    // Create sample user
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      rollNumber: '21CS001',
      department: 'Computer Science',
      semester: 4,
    });

    // Create sample exams
    const now = new Date();
    await Exam.create([
      {
        userId: user._id,
        subject: 'Data Structures',
        examDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        examType: 'Midterm',
        maxMarks: 100,
      },
      {
        userId: user._id,
        subject: 'Web Development',
        examDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        examType: 'Final',
        maxMarks: 100,
      },
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedData();
```

Run with: `node seed.js`

---

## Next Steps

1. **Explore the Dashboard** - See your upcoming exams and assignments
2. **Add Your Classes** - Set up your timetable in the Timetable section
3. **Create Assignments** - Add your assignments and track progress
4. **Mark Attendance** - Keep track of your attendance
5. **Take Notes** - Use the notes section for studying

---

## Support & Help

For issues:
1. Check the troubleshooting section above
2. Review the README.md for feature documentation
3. Check browser console for errors (F12)
4. Check terminal output for backend errors

---

Happy Studying! 📚✨
