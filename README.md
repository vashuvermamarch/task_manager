# 📝 TaskFlow — Hand-Drawn Sketchbook Task Management System

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg?style=for-the-badge&logo=react)](https://mongodb.com)
[![Vite](https://img.shields.io/badge/Frontend-Vite%20%2B%20React-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

TaskFlow is a highly creative, responsive, and secure full-stack Task Management Web Application built on the **MERN** stack (MongoDB, Express, React, and Node.js). 

Instead of traditional clinical, corporate interfaces, TaskFlow implements a playful, highly custom **Hand-Drawn Sketchbook Design System** featuring organic wobbly borders, warm paper textures, and solid offset shadows simulating sticky notes on notebook paper.

---

## 🎨 Visual Identity & Sketchbook Aesthetics

TaskFlow embraces a "hand-crafted" visual identity that provides micro-interactions and tactile feedback to users:

*   **Warm Paper Canvas**: Soft paper-grid background texture with pencil-sketch coloring.
*   **Handwritten Typography**: Custom Google Fonts integrations using **Kalam** for felt-tip headers and **Patrick Hand** for legible handwritten body copy.
*   **Wobbly Borders**: Fully custom irregular border-radius envelopes (`border: 3px solid #2d2d2d`) rejecting geometric straight lines.
*   **Hard Offset Shadows**: Distinct 3D cut-paper layered depth styling using solid offset shadows (`4px 4px 0px #2d2d2d` with no blur) that press flat on active hover/active actions.
*   **Sticky Note Accents**: Statistics metric cards styled as Post-It yellow notes (`#fff9c4`) rotated slightly at casual angles.

---

## 🚀 Key Features

*   🔐 **Secure JWT Authentication**: Form validation, secure account registration, and encrypted session tracking via persistent local storage.
*   📋 **Complete Task CRUD**: Easy-to-use task creation, reading, updating, and status toggles (pending vs. completed) styled like felt-tip checkboxes.
*   📊 **Dynamic Stats Notebook**: Real-time counters tracking *Total*, *Pending*, and *Completed* tasks dynamically.
*   🔍 **Debounced Search & Filtering**: Instant search query debounce and filter-by-status tab navigators.
*   📅 **Sorting & Due Dates**: Sort tasks by Date Created, Title, or Due Date in ascending or descending sequence.
*   🗂️ **Database Pagination**: Optimizes server fetches and page render loads when task lists grow.
*   📱 **Responsive Mobile Layout**: Grid cards collapse cleanly into a single-column layout stream on smaller screens.

---

## ⚙️ Tech Stack

### Frontend
- **React.js & Vite**: Fast development server and optimized build bundling.
- **Axios**: Promised-based HTTP requests featuring automatic JWT authorization headers injection.
- **Lucide Icons**: Crisp, customizable SVGs matching handwritten styles.
- **Vanilla CSS**: Premium bespoke responsive layouts and keyframe animations.

### Backend
- **Node.js & Express**: High-performance RESTful routing and middleware handlers.
- **JSON Web Tokens (JWT)**: Secure stateless authorization keys stored securely.
- **Bcryptjs**: Robust salted password hashing.

### Database
- **MongoDB & Mongoose**: Flexible, schema-based ODM mapping task documents to authenticated users.

---

## 📁 Project Structure

```text
Task Management Web Application/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── api/axios.js        # Central Axios instance with JWT interceptor
│   │   ├── components/         # Reusable UI parts (Navbar, TaskForm, TaskItem, TaskList)
│   │   ├── context/            # AuthContext supplying login/signup global actions
│   │   ├── hooks/useAuth.js    # Context custom hook wrapper
│   │   ├── pages/              # Panel pages (Login, Register, Dashboard)
│   │   ├── utils/validators.js # Authentication/Task validation helpers
│   │   └── index.css           # Premium sketchbook styling system
│   ├── index.html              # Google Web Fonts import definition
│   └── .env                    # Client side API base URL endpoint
├── server/                     # Express REST API
│   ├── config/db.js            # Mongoose MongoDB connection setup
│   ├── controllers/            # Auth & Task controller business logic
│   ├── middleware/             # JWT protection and error handler middleware
│   ├── models/                 # Mongoose Schemas (User.js & Task.js)
│   ├── routes/                 # API Routes (authRoutes, taskRoutes)
│   ├── utils/generateToken.js  # JWT token generation helper
│   └── server.js               # Application entrypoint
├── run.bat                     # Windows concurrent environment startup script
└── vercel.json                 # Vercel deployment multi-directory configuration
```

---

## 🔧 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   MongoDB local instance or Atlas URI

### 1. Backend Server Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` folder:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/taskmanager
   JWT_SECRET=supersecretkey123taskmanagerkey
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Client Setup
1. Navigate to the `client` directory:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client` folder:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
4. Start the Vite React client:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚡ Running Locally (Concurrent Boot)

For easy local development, use the Windows batch file in the root directory. Double-clicking **`run.bat`** launches both the backend API and frontend dev server simultaneously in a single command shell.

---

## 🔌 API Endpoints Reference

### Authentication
| HTTP Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Create a new user account | No |
| **POST** | `/api/auth/login` | Authenticate user & receive access token | No |

### Tasks
| HTTP Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/tasks` | Fetch user tasks (supports search, sort, filter, paginate) | **Yes** (JWT) |
| **POST** | `/api/tasks` | Create a new task entry | **Yes** (JWT) |
| **PUT** | `/api/tasks/:id` | Update full task details | **Yes** (JWT) |
| **PATCH** | `/api/tasks/:id/status` | Quick-toggle task completion status | **Yes** (JWT) |
| **DELETE** | `/api/tasks/:id` | Delete task from notebook | **Yes** (JWT) |

---

## 🌐 Deploying to Vercel

TaskFlow is preconfigured for simple Vercel deployments. The root directory contains `vercel.json` routing rules for both frontend build assets and serverless node functions:

1. Install Vercel CLI globally (or link repository to Vercel dashboard):
   ```bash
   npm install -g vercel
   ```
2. Deploy directly from the root workspace:
   ```bash
   vercel
   ```
3. Add environment variables (`MONGO_URI`, `JWT_SECRET`, `VITE_API_BASE_URL`) inside the Vercel project settings.