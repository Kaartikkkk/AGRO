# AgroSmart: Full-Stack Agriculture Management 🌾🚀

**Project Overview**: A premium, full-stack platform designed to empower farmers with real-time weather, Mandy prices, AI-driven diagnostics, and multi-land management capabilities.

---

## 📂 Project Structure

```bash
AGRO/
├── database/               # Relational Architecture & Setup
│   ├── schema.sql           # Database Table Definitions
│   └── setup.md             # PostgreSQL Configuration Guide
├── agrosmart-frontend/     # React 19 + Tailwind 4.0 Dashboard
│   ├── src/
│   │   ├── components/      # Glassmorphic UI Library
│   │   ├── context/         # Auth & Multi-Farm State
│   │   ├── pages/           # Premium Routing Views
│   │   └── services/        # Axios API Interceptors
├── agrosmart-backend/      # Node.js + Sequelize + PostgreSQL
│   ├── src/
│   │   ├── controllers/     # Multi-Plot Business Logic
│   │   ├── models/          # Relational Data Models
│   │   ├── routes/          # Secure REST Endpoints
│   │   └── middleware/      # JWT Authentication Guards
└── app.py                  # Unified Platform Launcher (Python)
```

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS 4.0, Framer Motion, Lucide React |
| **Backend** | Node.js, Express, Sequelize ORM |
| **Database** | PostgreSQL (Relational) |
| **Security** | JWT (JSON Web Tokens), Bcrypt (Password Hashing) |
| **APIs** | OpenWeatherMap, OpenStreetMap (Nominatim Geocoding) |

---

## 🔥 Key Features

1. **Multi-Land Architecture**: Manage dozens of farm plots from a single "Smart Switcher".
2. **AI Disease Detection**: Premium scanner interface with genetic-analysis animations.
3. **Mandi Integration**: Real-time tracking of Indian market prices for staple crops.
4. **Onboarding Freedom**: Direct-to-Dashboard signup with optional detailed profile completion.
5. **Agro-Glass UI**: High-fidelity glassmorphism with sun-drenched agricultural visuals.

---

## 🚀 Quick Launch
1. Ensure PostgreSQL is running.
2. Run the unified platform launcher:
   ```bash
   python3 app.py
   ```
3. Access the dashboard at `http://localhost:5173`.
