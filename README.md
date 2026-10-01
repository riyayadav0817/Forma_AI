# Forma AI

> AI-augmented dynamic insurance claim assistant built with React, Vite, Node.js, Express, MongoDB, and OpenAI.

Forma AI helps users create and manage insurance claims through a simple guided workflow. Users can create an account, log in securely, describe an incident in natural language, automatically extract claim information, review the generated fields, attach supporting evidence, and manage saved claims.

---

## ✨ Features

### 🔐 Authentication

* User registration
* User login
* JWT-based authentication
* Password hashing with bcrypt
* Protected application routes
* Guest-only login/register pages
* Automatic session validation
* Logout functionality
* User profile information in the application header

### 🏠 Landing Page

The application starts with a dedicated landing page containing:

* Forma AI branding
* Product introduction
* Feature highlights
* How-it-works section
* AI claim workflow preview
* Call-to-action buttons
* Responsive design

### 🤖 AI Claim Extraction

Users can describe an insurance incident using natural language.

For example:

> "Yesterday my Honda was involved in an accident on the highway. The windshield and bumper were damaged."

Forma AI extracts structured information such as:

* Incident type
* Vehicle
* Location
* Damage
* Date
* Police report number
* Animal details

The backend supports:

1. OpenAI-powered extraction when an API key is configured.
2. A built-in rule-based extractor when OpenAI is unavailable.

This means the application can still perform basic extraction without an OpenAI API key.

### 📋 Dynamic Claim Form

Extracted information is displayed in a structured claim form.

Users can:

* Review extracted information
* Edit fields
* Identify missing information
* Improve claim completeness
* Submit/save claims

### 📎 Evidence Upload

Users can attach supporting evidence to claims.

Supported functionality includes:

* File selection
* Evidence listing
* File metadata
* File size display
* Evidence storage through the backend

### 💾 Saved Claims

Authenticated users can access their saved claims.

The claims dashboard provides:

* Claim cards
* Claim status
* Claim number
* Claim metadata
* Evidence count
* Search functionality
* Claim actions

### 🎨 UI / UX

Forma AI uses a clean insurance/fintech design system featuring:

* Navy + teal visual identity
* Responsive layouts
* Soft cards
* Rounded components
* Accessible form controls
* Loading states
* Toast notifications
* Empty states
* Progress/readiness indicators
* Mobile-friendly layouts

---

# 🧭 Application Flow

The application follows this user journey:

```text
Landing Page
     │
     ▼
   Login
     │
     ├───────────────┐
     │               │
     ▼               ▼
 Login          Registration
     │               │
     └───────┬───────┘
             │
             ▼
       Forma AI App
             │
             ▼
      Create Claim
             │
             ▼
       Magic Input
             │
             ▼
    AI/Data Extraction
             │
             ▼
      Review Fields
             │
             ▼
     Add Evidence
             │
             ▼
       Save Claim
             │
             ▼
      Saved Claims
```

---

# 🏗️ Project Structure

```text
Forma_AI/
│
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── Claim.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   └── claims.js
│   │
│   ├── services/
│   │   └── extraction.js
│   │
│   ├── uploads/
│   │
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── App.jsx
│       ├── App.css
│       ├── auth.css
│       ├── landing.css
│       ├── index.css
│       └── main.jsx
│
├── .gitignore
└── README.md
```

---

# 🛠️ Technology Stack

## Frontend

* React 19
* React DOM
* Vite
* JavaScript / JSX
* CSS
* Inter font

## Backend

* Node.js
* Express 5
* MongoDB
* Mongoose
* JWT
* bcryptjs
* Multer
* Zod
* OpenAI API
* dotenv
* CORS

## Database

MongoDB is used to store:

* User accounts
* Authentication-related user information
* Insurance claims
* Extracted claim information
* Evidence metadata

---

# 📋 Requirements

Before running Forma AI locally, install:

* Node.js
* npm
* MongoDB

You can use either:

* Local MongoDB
* MongoDB Atlas

Check Node.js and npm:

```bash
node --version
npm --version
```

---

# 🚀 Installation

## 1. Clone / Extract the Project

Place the project somewhere convenient.

Example:

```text
D:\Forma_AI_with_auth\Forma_AI
```

The project should contain:

```text
Forma_AI/
├── backend/
└── frontend/
```

---

# 🔧 Backend Setup

Open PowerShell or Terminal:

```powershell
cd D:\Forma_AI_with_auth\Forma_AI\backend
```

Install backend dependencies:

```powershell
npm install
```

Start the backend:

```powershell
node server.js
```

A successful startup should look similar to:

```text
✅ MongoDB connected successfully
🚀 Backend running on http://localhost:5000
```

The backend API will be available at:

```text
http://localhost:5000/api
```

---

# 🔐 Backend Environment Variables

Create:

```text
backend/.env
```

Example:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/forma-ai

PORT=5000

JWT_SECRET=your_secure_jwt_secret

FRONTEND_URL=http://localhost:5173

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

### Environment variables

| Variable         | Purpose                             |
| ---------------- | ----------------------------------- |
| `MONGODB_URI`    | MongoDB connection string           |
| `PORT`           | Backend server port                 |
| `JWT_SECRET`     | Secret used to sign JWT tokens      |
| `FRONTEND_URL`   | Frontend URL allowed by the backend |
| `OPENAI_API_KEY` | Optional OpenAI API key             |
| `OPENAI_MODEL`   | OpenAI model used for extraction    |

### OpenAI is optional

If:

```env
OPENAI_API_KEY=
```

is empty, Forma AI uses its built-in rule-based extraction system.

If an OpenAI key is provided, the backend attempts AI-powered extraction first.

---

# 💻 Frontend Setup

Open a **new terminal**.

```powershell
cd D:\Forma_AI_with_auth\Forma_AI\frontend
```

Install dependencies:

```powershell
npm install
```

Start the Vite development server:

```powershell
npm run dev
```

The frontend should be available at:

```text
http://localhost:5173
```

---

# 🌐 Frontend Environment Variables

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

This tells the React application where the backend API is running.

---

# ▶️ Running the Full Application

You need **two terminals**.

## Terminal 1 — Backend

```powershell
cd D:\Forma_AI_with_auth\Forma_AI\backend
node server.js
```

Expected:

```text
✅ MongoDB connected successfully
🚀 Backend running on http://localhost:5000
```

## Terminal 2 — Frontend

```powershell
cd D:\Forma_AI_with_auth\Forma_AI\frontend
npm run dev
```

Expected:

```text
Local: http://localhost:5173/
```

Then open:

```text
http://localhost:5173
```

---

# 🔑 Authentication Flow

### New user

```text
/
↓
Landing
↓
Register
↓
Create Account
↓
Forma AI App
```

### Existing user

```text
/
↓
Landing
↓
Login
↓
Forma AI App
```

### Unauthenticated user

Attempting to access the protected application redirects the user to:

```text
/login
```

### Authenticated user

Attempting to access login/register while already authenticated redirects the user to:

```text
/app
```

---

# 🤖 Claim Extraction

The claim extraction service uses two possible approaches.

## AI Extraction

When `OPENAI_API_KEY` is configured, Forma AI sends the claim description to the configured OpenAI model.

The expected structured response contains:

```json
{
  "incidentType": "",
  "vehicle": "",
  "location": "",
  "damage": "",
  "date": "",
  "policeReportNumber": "",
  "animalDetails": ""
}
```

The response is validated using Zod before being returned to the application.

## Rule-Based Extraction

If OpenAI is unavailable, Forma AI automatically falls back to deterministic keyword extraction.

Examples of recognized concepts include:

```text
Accident
Theft
Animal Collision
Honda
Toyota
BMW
Ford
Hyundai
Maruti Suzuki
Tata
Windshield
Bumper
Door
Glass
Highway
Parking lot
Yesterday
Today
Last night
```

---

# 📦 Backend API

The backend exposes API endpoints under:

```text
/api
```

## Authentication

### Register

```http
POST /api/auth/register
```

Example request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

### Login

```http
POST /api/auth/login
```

Example:

```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

### Current User

```http
GET /api/auth/me
```

Requires:

```http
Authorization: Bearer <token>
```

---

# 🗃️ Claim Data

Each claim can contain:

```text
Claim number
Claim description
Incident type
Vehicle
Location
Damage
Date
Police report number
Animal details
Status
Assigned agent
Evidence
Created date
Updated date
```

Claims are associated with the authenticated user through:

```text
userId
```

---

# 🔒 Security

The application includes:

* Password hashing using bcrypt
* JWT authentication
* Protected API routes
* Role-aware authorization middleware
* User-specific claim ownership
* Environment variables for secrets
* Server-side request validation
* Zod validation for AI extraction results

### Important

Never commit your real `.env` file to Git.

The following should remain private:

```env
JWT_SECRET
MONGODB_URI
OPENAI_API_KEY
```

---

# 🧪 Development Commands

## Frontend

Install:

```bash
npm install
```

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

## Backend

Install:

```bash
npm install
```

Start:

```bash
node server.js
```

If nodemon is configured:

```bash
npx nodemon server.js
```

---

# 🐛 Troubleshooting

## `Cannot find module 'express'`

Go to the backend folder:

```powershell
cd backend
```

Run:

```powershell
npm install
```

Then:

```powershell
node server.js
```

---

## `MongoDB connection failed`

Check that MongoDB is running.

For local MongoDB, the default connection is:

```text
mongodb://127.0.0.1:27017/forma-ai
```

Also verify:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/forma-ai
```

---

## `Registration failed`

Check the backend terminal.

The browser may only display:

```text
Registration failed
```

while the actual error is printed by the backend.

Look for:

```text
Registration error:
```

---

## `Invalid or expired authentication token`

Log out and log in again.

If the problem persists, check that:

```env
JWT_SECRET=your_secure_jwt_secret
```

is configured consistently and that the backend has been restarted after changing `.env`.

---

## Frontend cannot connect to backend

Check that the backend is running:

```text
http://localhost:5000
```

Then verify:

```env
VITE_API_URL=http://localhost:5000/api
```

Restart Vite after changing `.env`:

```powershell
npm run dev
```

---

## Port already in use

If port `5000` is already being used, stop the existing Node process or change:

```env
PORT=5001
```

If you change the backend port, also update the frontend:

```env
VITE_API_URL=http://localhost:5001/api
```

---

# 📱 Responsive Design

Forma AI is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile

The interface adapts the:

* Navigation
* Forms
* Claim cards
* Buttons
* Layout grids
* Authentication pages
* Evidence uploader

for smaller screens.

---

# 🧩 Application Modules

```text
Landing
│
├── Hero
├── Features
├── How It Works
└── CTA
```

```text
Authentication
│
├── Login
├── Register
├── JWT Session
└── Logout
```

```text
Forma AI Workspace
│
├── Magic Input
├── Claim Extraction
├── Dynamic Fields
├── Readiness
├── Evidence
└── Saved Claims
```

---

# 🔄 Typical Claim Workflow

A typical claim can be created using the following process:

### 1. Describe the incident

The user enters a natural-language description.

Example:

```text
Yesterday my Honda was involved in an accident on the highway.
The windshield and bumper were damaged.
```

### 2. Extract information

Forma AI identifies relevant information.

Example:

```text
Incident Type: Accident
Vehicle: Honda
Location: Highway
Damage: Windshield damaged, Bumper damaged
Date: Yesterday
```

### 3. Review

The user reviews and edits the extracted fields.

### 4. Add evidence

The user can upload supporting documents or files.

### 5. Save the claim

The claim is stored in MongoDB and associated with the authenticated account.

---

# 🎨 Design System

Forma AI uses a navy and teal insurance/fintech visual system.

Primary colors include:

```text
Brand Teal: #0f766e
Brand Dark: #115e59
Navy:       #17324d
Background: #f4f7fa
Surface:    #ffffff
Text:       #172033
Muted:      #64748b
```

The interface uses:

* Rounded cards
* Subtle shadows
* Light borders
* Teal primary actions
* Navy headings
* Clear semantic colors
* Responsive spacing

---

# 🔮 Future Improvements

Possible future improvements include:

* Email verification
* Password reset
* Social login
* Multi-factor authentication
* Admin dashboard
* Insurance agent dashboard
* Claim status timeline
* Advanced document OCR
* PDF claim reports
* AI claim recommendations
* Fraud detection assistance
* Cloud file storage
* Production deployment
* Automated tests
* Rate limiting
* Audit logs

---

# 📄 License

This project is currently intended for development and educational/project use.

Add an appropriate license before distributing the application commercially.

---

# 👨‍💻 Local Development Checklist

Before starting development, make sure:

* [ ] Node.js is installed
* [ ] MongoDB is running
* [ ] Backend dependencies are installed
* [ ] Frontend dependencies are installed
* [ ] Backend `.env` exists
* [ ] `JWT_SECRET` is configured
* [ ] `MONGODB_URI` is configured
* [ ] Frontend `.env` exists
* [ ] `VITE_API_URL` points to the backend
* [ ] Backend is running on port `5000`
* [ ] Frontend is running on port `5173`

Then open:

```text
http://localhost:5173
```

---

# 🚀 Quick Start

If everything is already configured, the entire project can be started with two terminals.

### Terminal 1

```powershell
cd backend
npm install
node server.js
```

### Terminal 2

```powershell
cd frontend
npm install
npm run dev
```

Then visit:

```text
http://localhost:5173
```

**Forma AI — turning insurance claim stories into structured, manageable claims.**
