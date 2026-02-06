# Gatherly - Local Development Setup

Complete guide to run Gatherly on your local machine.

---

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB Atlas** account ([Sign up](https://www.mongodb.com/atlas))
- **Git** (optional, for cloning)

---

## Step 1: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a new cluster (M0 Free tier is sufficient)
3. Click "Database Access" → "Add New Database User"
   - Create a username and password (save these!)
4. Click "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (add `0.0.0.0/0`)
5. Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user's password
   - Replace `myFirstDatabase` with `gatherly`

Example connection string:
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/gatherly?retryWrites=true&w=majority
```

---

## Step 2: Backend Setup

### Navigate to backend folder:
```bash
cd gatherly-backend
```

### Install dependencies:
```bash
npm install
```

### Configure environment variables:

Edit the `.env` file:
```bash
# On Windows:
notepad .env

# On Mac/Linux:
nano .env
```

Update with your MongoDB connection string:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/gatherly?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
FRONTEND_URL=http://localhost:5173
```

**Important**: Replace `YOUR_USERNAME`, `YOUR_PASSWORD`, and `cluster0.xxxxx` with your actual MongoDB Atlas credentials.

### Start the backend server:

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
Server running on port 5000
Environment: development
MongoDB Connected: cluster0.xxxxx.mongodb.net
```

The backend API is now running at `http://localhost:5000`

Test it: http://localhost:5000/api/health

---

## Step 3: Frontend Setup

Open a **new terminal window** (keep the backend running).

### Navigate to frontend folder:
```bash
cd app
```

### Install dependencies:
```bash
npm install
```

### The `.env.local` file is already configured:
```env
VITE_API_URL=http://localhost:5000/api
```

### Start the frontend development server:
```bash
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

## Step 4: Access the Application

Open your browser and go to:

**Frontend**: http://localhost:5173

**Backend API**: http://localhost:5000/api

---

## Project Structure (Local)

```
gatherly/
├── gatherly-backend/          # Backend (Port 5000)
│   ├── server.js              # Main server file
│   ├── .env                   # Environment variables (EDIT THIS!)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── middleware/
│
├── app/                       # Frontend (Port 5173)
│   ├── src/
│   │   ├── pages/            # React pages
│   │   ├── api/              # API functions
│   │   ├── store/            # Zustand store
│   │   └── components/
│   ├── .env.local            # Frontend env (already configured)
│   └── package.json
│
├── LOCAL_SETUP.md            # This file
├── DEPLOYMENT_GUIDE.md       # AWS deployment guide
└── README.md                 # Project overview
```

---

## Available Scripts

### Backend (`cd gatherly-backend`)

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon (auto-restart) |

### Frontend (`cd app`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## Testing the Application

### 1. Sign Up
- Go to http://localhost:5173/signup
- Create a new account with username, email, and password

### 2. Log In
- Use your credentials to log in
- You'll be redirected to the Events page

### 3. Create an Event
- Click "Create Event" button
- Fill in event details (title, description, date, location)
- Submit to create the event

### 4. Join an Event
- Click "Join Event" on any event card
- Once joined, click "Open Chat" to enter the chat room

### 5. Real-time Chat
- Type messages in the chat input
- Open another browser/incognito window
- Log in as a different user and join the same event
- See messages appear in real-time!

### 6. Blog Posts
- Click "View Blogs" to go to the blog page
- Click "Write Blog" to create a new post
- Edit or delete your own blog posts

---

## Troubleshooting

### Backend won't start

**Error: "Cannot connect to MongoDB"**
- Check your MongoDB Atlas connection string in `.env`
- Verify your database user's password is correct
- Make sure your IP is whitelisted in MongoDB Atlas (Network Access)

**Error: "Port 5000 already in use"**
```bash
# Find and kill the process using port 5000
# On Mac/Linux:
lsof -ti:5000 | xargs kill -9

# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Frontend can't connect to backend

**Error: "Failed to fetch" or CORS errors**
- Make sure backend is running on port 5000
- Check `VITE_API_URL` in `app/.env.local` is `http://localhost:5000/api`
- Verify `FRONTEND_URL` in `gatherly-backend/.env` is `http://localhost:5173`

### Chat not working

- Check browser console for WebSocket errors
- Ensure backend is running (Socket.io is part of the backend server)
- Try refreshing the page

---

## Stopping the Servers

To stop the servers:

- **Backend**: Press `Ctrl + C` in the terminal
- **Frontend**: Press `Ctrl + C` in the terminal

---

## Next Steps

Once you've tested locally and want to deploy to production:

📖 See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for AWS EC2 deployment instructions.

---

## Quick Reference

```bash
# Terminal 1 - Backend
cd gatherly-backend
npm install
# Edit .env with your MongoDB URI
npm run dev

# Terminal 2 - Frontend
cd app
npm install
npm run dev

# Open browser: http://localhost:5173
```

Happy coding! 🚀
