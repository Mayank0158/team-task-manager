# TaskFlow — Team Task Manager

A full-stack MERN application for managing team tasks and projects with role-based access control.

## Tech Stack
- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcrypt

## Features
- JWT-based authentication (signup/login)
- Create and manage projects
- Role-based access (Admin / Member)
- Admin can add/remove team members
- Create, assign, and track tasks
- Task filtering by status (To Do, In Progress, Done)
- Dashboard with stats: total tasks, by status, overdue, tasks per user

## Setup & Run Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/team-task-manager.git
cd team-task-manager
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

## API Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/signup` | Register user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Auth |
| POST | `/api/projects` | Create project | Auth |
| GET | `/api/projects` | Get user projects | Auth |
| GET | `/api/projects/:id` | Get project by ID | Auth |
| POST | `/api/projects/:id/members` | Add member (by email) | Admin |
| DELETE | `/api/projects/:id/members/:userId` | Remove member | Admin |
| POST | `/api/tasks` | Create task | Admin |
| GET | `/api/tasks/project/:projectId` | Get tasks (role-filtered) | Auth |
| PATCH | `/api/tasks/:id/status` | Update task status | Admin/Assigned |
| GET | `/api/tasks/dashboard` | Dashboard stats | Auth |

## Role-Based Access
- **Admin** (project creator): Can create tasks, assign to members, add/remove members, update any task
- **Member**: Can only view tasks assigned to them and update their own task status

## Deployment (Railway)

The application is fully configured for automated deployment on Railway as a monorepo.

### Backend Deployment
1. Push the code to GitHub.
2. In Railway, click "New Project" → "Deploy from GitHub repo" and select this repository.
3. Go to the service **Settings** and set the **Root Directory** to `/backend`.
4. Railway will automatically use the provided `railway.json` to build and run the node server.
5. In the **Variables** tab, add your environment variables: `MONGO_URI`, `JWT_SECRET`, and `PORT` (e.g., 5000).
6. Generate a domain in the **Networking** tab.

### Frontend Deployment
1. In the same Railway project, click "New" → "GitHub Repo" and select the repository again to create a second service.
2. Go to the service **Settings** and set the **Root Directory** to `/frontend`.
3. Railway will automatically use the provided `Dockerfile` to build the Vite app and serve it using Node.js.
4. In the **Variables** tab, add the environment variable: `VITE_API_URL` (set it to the backend domain generated in the previous step, e.g., `https://your-backend.railway.app/api`).
5. Generate a domain in the **Networking** tab.
6. Trigger a redeploy if necessary to bake the environment variable into the frontend build.

## Project Structure
```
team-task-manager/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   └── taskController.js
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── project.js
│   │   └── task.js
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/axios.js
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── .env
└── README.md
```
