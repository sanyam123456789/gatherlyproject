# 🎉 Gatherly - Event & Community Platform

A modern, full-stack event management and community platform with real-time features, built with the MERN stack.

## ✨ Features

- 🎭 **Unique Cute Usernames** - Auto-generated playful display names
- 🐧 **Penguin Companion** - Adorable cursor-following companion with animations
- ⚡ **Real-Time Events** - Live mock event updates via Socket.io
- 🎵 **Event Categories** - Filter by Concerts, Travel, or Trekking
- 💬 **Group Chat** - Real-time chat for each event
- 👤 **User Profiles** - Customizable profiles with avatars and activity tracking
- 🎨 **Bluish Theme** - Beautiful gradient UI with glassmorphism effects
- 📝 **Blogs** - Community blog system (enhanced features)

## 🚀 Tech Stack

**Frontend:**
- React + TypeScript
- Vite
- Tailwind CSS
- Socket.io Client
- Zustand (State Management)
- Radix UI Components

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Socket.io
- JWT Authentication
- bcrypt

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Kimi222
   ```

2. **Backend Setup**
   ```bash
   cd gatherly-backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd app
   npm install
   
   # Create .env.local file
   cp .env.local.example .env.local
   # Edit .env.local with your API URL
   
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5002

## 🎨 Features Overview

### Penguin Companion
Toggle-able cute penguin that follows your cursor with idle wave animations every 10 seconds.

### Real-Time Mock Events
Server broadcasts new events every 45 seconds to demonstrate real-time capabilities.

### Event Categories
- 🎵 Concerts
- ✈️ Travel
- 🏔 Trekking

### Profile System
- Customizable display names and avatars
- View joined events
- Track blog posts

## 📝 Environment Variables

**Backend (.env):**
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5002
NODE_ENV=development
```

**Frontend (.env.local):**
```
VITE_API_URL=http://localhost:5002/api
```

## 🛠️ Development

- **Frontend Dev Server**: `npm run dev` (in `app` directory)
- **Backend Dev Server**: `npm start` (in `gatherly-backend` directory)
- **Build Frontend**: `npm run build` (in `app` directory)

## 🎯 Usage

1. **Sign Up** - Create an account with auto-generated cute username
2. **Browse Events** - Filter by category or view all events
3. **Join Events** - Join events and access group chat
4. **Chat** - Real-time messaging with other attendees
5. **Profile** - Customize your profile and view activity
6. **Settings** - Toggle penguin companion on/off

## 📸 Screenshots

*Coming soon!*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Built with ❤️ for the community

---

**Note**: The real-time mock event broadcasting is for demonstration purposes. In production, this should be integrated with actual event creation.
