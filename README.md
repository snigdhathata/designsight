# DesignSight - AI-Powered Design Feedback Platform

DesignSight is a MERN stack application that provides AI-powered design feedback with coordinate-anchored comments, role-based filtering, and collaborative discussion features.

## 🚀 Features

- **AI-Powered Analysis**: Real OpenAI GPT-4V integration for design analysis
- **Coordinate-Anchored Feedback**: Click on design areas to view specific feedback
- **Role-Based Views**: Filter feedback by team role (Designer, Reviewer, Product Manager, Developer)
- **Collaborative Discussions**: Threaded comments on feedback items
- **Export Capabilities**: PDF and JSON export for development handoff
- **Project Management**: Create and manage design projects
- **Real-time Updates**: Live feedback analysis and collaboration

## 🛠 Tech Stack

- **Frontend**: React 18, Styled Components, React Router
- **Backend**: Node.js, Express.js, MongoDB
- **AI Integration**: OpenAI GPT-4V API
- **Deployment**: Docker, Docker Compose
- **Authentication**: JWT-based auth

## 📋 Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- OpenAI API Key

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd designsight
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Optional: Override default settings
MONGODB_URI=mongodb://admin:password123@localhost:27017/designsight?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 3. Run with Docker Compose

```bash
# Start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

## 🔧 Development Setup

### Backend Development

```bash
cd server
npm install
cp env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Development

```bash
cd client
npm install
npm start
```

## 📖 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Project Endpoints

- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `POST /api/projects/:id/designs` - Upload design
- `GET /api/projects/:id/designs` - Get project designs

### Feedback Endpoints

- `GET /api/feedback/design/:id` - Get design feedback
- `GET /api/feedback/design/:id/stats` - Get feedback statistics
- `POST /api/feedback/design/:id/retry-analysis` - Retry AI analysis

### Comment Endpoints

- `GET /api/comments/design/:designId/feedback/:feedbackItemId` - Get comments
- `POST /api/comments/design/:designId/feedback/:feedbackItemId` - Create comment
- `PUT /api/comments/:commentId` - Update comment
- `DELETE /api/comments/:commentId` - Delete comment

### Export Endpoints

- `GET /api/export/design/:id/pdf` - Export as PDF
- `GET /api/export/design/:id/json` - Export as JSON

## 🎯 Usage Guide

### 1. Create an Account

Register with your email and select your role (Designer, Reviewer, Product Manager, or Developer).

### 2. Create a Project

- Click "Create Project" on the dashboard
- Set project name, description, and AI analysis settings
- Choose feedback categories to focus on

### 3. Upload Designs

- Navigate to your project
- Click "Upload Design" and select an image file
- Wait for AI analysis to complete (usually 10-30 seconds)

### 4. Review Feedback

- Click on highlighted areas in the design to view feedback
- Filter feedback by role, category, or severity
- Switch between different team perspectives

### 5. Collaborate

- Add comments on specific feedback items
- Reply to existing comments
- Mark items as resolved
- React to comments

### 6. Export Results

- Export feedback as PDF for design handoff
- Export as JSON for integration with other tools
- Filter exports by role or category

## 🔍 AI Analysis Categories

- **Accessibility**: Color contrast, text readability, navigation issues
- **Visual Hierarchy**: Spacing, alignment, typography consistency  
- **Content & Copy**: Tone, clarity, messaging effectiveness
- **UI/UX Patterns**: Button placement, user flow, best practices

## 💰 Cost Estimation

### OpenAI API Costs (Approximate)

- **GPT-4V Analysis**: ~$0.01-0.03 per image
- **Demo Usage**: 1-2 images = $0.02-0.06
- **Production Usage**: 100 images/month = $1-3

### Infrastructure Costs

- **Development**: Free (local Docker)
- **Production**: ~$20-50/month (VPS + MongoDB Atlas)



### Debug Mode

```bash
# Enable debug logging
NODE_ENV=development docker-compose up
```

## 🧪 Testing

```bash
# Run backend tests
cd server && npm test

# Run frontend tests  
cd client && npm test

# Run all tests
npm test
```

## 📁 Project Structure

```
designsight/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   └── public/
├── server/                 # Express backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── middleware/         # Express middleware
├── docker-compose.yml      # Docker configuration
└── README.md
```





