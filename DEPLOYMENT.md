# LEGAL EASE — DEPLOYMENT GUIDE (முழுமையான வழிகாட்டி)

இந்த ஆவணத்தில் **LegalEase** அப்ளிகேஷனை பல்வேறு Cloud பிளாட்ஃபார்ம்களில் மிக எளிதாக deploy செய்யும் 4 முக்கிய வழிகள் கொடுக்கப்பட்டுள்ளன:

---

## 🚀 வழி 1: Streamlit Community Cloud (100% இலவசம் & 2 நிமிடங்களில் Live)
> **சிறந்தது:** PDF விவரக்குறிப்பில் உள்ள Streamlit Frontend (`app.py`) மற்றும் Gemini AI அப்ளிகேஷனை உலகளவில் யாருக்கும் பகிர.

### படிகள்:
1. **GitHub-ல் Push செய்யவும்:**
   ```bash
   git add .
   git commit -m "Deploy LegalEase to Streamlit Cloud"
   git push origin main
   ```
2. **Streamlit Cloud-க்கு செல்லவும்:**
   - உலாவியில் [share.streamlit.io](https://share.streamlit.io) திறக்கவும்.
   - உங்கள் GitHub கணக்குடன் உள்நுழையவும் (Login).
3. **New App உருவாக்கவும்:**
   - **Repository:** உங்கள் LegalEase GitHub repo-வை தேர்ந்தெடுக்கவும்.
   - **Branch:** `main`
   - **Main file path:** `app.py`
4. **Environment Variables (Secrets) சேர்க்கவும்:**
   - **Advanced settings** கிளிக் செய்து **Secrets** பெட்டியில் உள்ளிடவும்:
     ```toml
     GEMINI_API_KEY = "your-google-gemini-api-key-here"
     ```
5. **Deploy கிளிக் செய்யவும்!**
   - 2 நிமிடங்களில் `https://legalease-ai.streamlit.app` போன்ற நேரடி URL கிடைக்கும்!

---

## 🌐 வழி 2: Render.com (FastAPI Backend + Streamlit)
> **சிறந்தது:** FastAPI API & Streamlit இரண்டையும் இலவசமாக இயக்க.

### படிகள்:
1. [render.com](https://render.com)-ல் கணக்கு தொடங்கவும்.
2. **New +** கிளிக் செய்து **Web Service** தேர்ந்தெடுக்கவும்.
3. உங்கள் GitHub repository-ஐ இணைக்கவும் (Connect).
4. விவரங்களை நிரப்பவும்:
   - **Name:** `legalease-backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:**
     - FastAPI Backend-க்கு:
       ```bash
       uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
       ```
     - அல்லது Streamlit UI-க்கு:
       ```bash
       streamlit run app.py --server.port $PORT --server.address 0.0.0.0
       ```
5. **Environment Variables:**
   - `GEMINI_API_KEY` = உங்கள் Gemini API Key
   - `MOCK_AI` = `false`
   - `JWT_SECRET` = உங்கள் ரகசிய சாவி (Secret Key)
6. **Deploy Web Service** கிளிக் செய்யவும்.

---

## ⚡ வழி 3: Vercel (Next.js SaaS Frontend) + Render (FastAPI Backend)
> **சிறந்தது:** முழுமையான Full-Stack SaaS பிளாட்ஃபார்மை (Next.js 14 Web App) உலகத்தரம் வாய்ந்த வேகத்தில் இயக்க.

1. **Backend:** மேலே உள்ள **வழி 2 (Render)** மூலம் deploy செய்து URL-ஐ பெறவும் (எ.கா: `https://legalease-api.onrender.com`).
2. **Frontend on Vercel:**
   - [vercel.com](https://vercel.com)-க்கு சென்று உங்கள் GitHub repository-ஐ import செய்யவும்.
   - **Root Directory:** `frontend` என மாற்றவும்.
   - **Environment Variables:**
     ```
     NEXT_PUBLIC_API_URL = https://legalease-api.onrender.com/api
     ```
   - **Deploy** கிளிக் செய்யவும்.

---

## 🐳 வழி 4: Docker & Docker Compose (AWS EC2, DigitalOcean, VPS)
> **சிறந்தது:** சொந்த சர்வரில் (Ubuntu VPS / AWS EC2) ஒரே கமாண்டில் PostgreSQL, Backend, Frontend அனைத்தையும் இயக்க.

### படிகள்:
1. சர்வரில் Docker மற்றும் Docker Compose நிறுவவும்:
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose -y
   ```
2. Repository-ஐ clone செய்து டைரக்டரிக்கு செல்லவும்:
   ```bash
   git clone https://github.com/your-username/LegalEase.git
   cd LegalEase
   ```
3. `.env` ஃபைலில் உங்கள் API Key-களை அமைக்கவும்:
   ```bash
   cp .env.example .env
   nano .env
   ```
4. Docker Compose மூலம் அனைத்தையும் இயக்கவும்:
   ```bash
   docker-compose up -d --build
   ```
5. **அணுகல் (Access):**
   - **Next.js Web SaaS:** `http://YOUR_SERVER_IP:3000`
   - **FastAPI Backend:** `http://YOUR_SERVER_IP:8000`
   - **Swagger API Docs:** `http://YOUR_SERVER_IP:8000/docs`
