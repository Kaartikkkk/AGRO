# AgroSmart 🌾

AgroSmart is a unified agriculture platform featuring a dynamic React frontend, an Express.js/PostgreSQL backend with PostGIS spatial tracking, and a Python-powered precision agriculture AI engine.

## Project Structure

- **`/agrosmart-frontend`**: React/Vite web application.
- **`/agrosmart-backend`**: Node.js REST API with Express. Connected to a PostgreSQL database with the PostGIS extension.
- **`/database`**: Contains SQL schemas and setup instructions.
- **`app.py`**: A unified launcher script to start both the frontend and backend servers simultaneously.
- **`inference.py`**: A standalone AI script that interacts with the OpenAI API for precision agriculture recommendations.

## Quickstart Guide

### Prerequisites
1. **Node.js** (v18+)
2. **Python 3.10+**
3. **PostgreSQL 18+** with the **PostGIS** extension installed.

### Installation

1. Copy the example `.env` files and populate them with your secrets:
   ```bash
   cp .env.example .env
   cp agrosmart-backend/.env.example agrosmart-backend/.env
   ```

2. Make sure PostgreSQL is running and you have created the `agrosmart` database:
   ```bash
   createdb agrosmart
   ```

3. Start the unified application (this will automatically run `npm install` and start both servers):
   ```bash
   python3 app.py
   ```
   - **Frontend**: http://localhost:5173
   - **Backend**: http://localhost:5000

## AI Inference Engine

To run the AI baseline engine, ensure your `OPENAI_API_KEY` is set in the root `.env` file and run:
```bash
python3 inference.py
```
