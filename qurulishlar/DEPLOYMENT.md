# 🚀 Cardlar Collaboration Hub - Deployment Guide

This project now ships with a **React front-end** (static) and a **Django REST API** backend. Use Vercel for the UI and Render/Railway for the API.

## 📁 Updated Structure
```
qurulishlar/
├── index.html          # React (CDN) entrypoint
├── styles.css          # UI styling
├── script.js           # React app logic
├── backend/            # Django API
│   ├── manage.py
│   ├── requirements.txt
│   ├── cardlar/
│   └── core/
└── vercel.json         # Vercel configuration
```

## ✅ Frontend: Vercel
1. Push the repo to GitHub.
2. Import the repository on Vercel.
3. Vercel will deploy the static site automatically.
4. Update `API_BASE_URL` on the frontend to point at your Django API if needed.
   - Example: add a small inline script before `script.js`:
     ```html
     <script>window.API_BASE_URL = "https://your-api.onrender.com/api";</script>
     ```

## ✅ Backend: Render or Railway
1. Create a new web service from your repo.
2. Set the root to `backend/`.
3. Build command:
   ```bash
   pip install -r requirements.txt
   python manage.py migrate
   ```
4. Start command:
   ```bash
   gunicorn cardlar.wsgi
   ```
5. Add environment variables:
   - `DJANGO_SECRET_KEY`
   - `DJANGO_DEBUG=false`
   - `DJANGO_ALLOWED_HOSTS=your-api.onrender.com`
   - `DATABASE_URL=postgres://...` (provided by Render/Railway)

## ✅ Database: PostgreSQL
Render/Railway provide a managed PostgreSQL database. Paste the `DATABASE_URL` into your backend environment variables.

## 🔐 Auth & Protected Routes
- JWT login: `POST /api/auth/token/`
- JWT signup: `POST /api/auth/signup/`
- Protected endpoints: `POST /api/projects/`, `POST /api/applications/`

## 🧪 Local Development
```bash
# Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend
cd ..
python -m http.server 3000
```
Visit `http://localhost:3000` and the app will call `http://localhost:8000/api`.
