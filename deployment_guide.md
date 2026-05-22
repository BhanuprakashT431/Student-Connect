# Deployment & Local Execution Guide

This guide outlines how to execute the **Career Guidance Portal MVP** locally and deploy it to cloud platforms (**Render** and **Vercel**).

---

## 1. Local Development Execution

To run the application locally on your computer, follow these simple setup steps.

### A. Start the FastAPI Backend
1. **Navigate to the backend folder**:
   ```bash
   cd backend
   ```
2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
   > [!TIP]
   > **Windows Installation Note**: `psycopg2-binary` (the PostgreSQL database adapter) sometimes fails to install on Windows due to missing C compiler dependencies or compiler binary mismatches. Since local development uses SQLite (which is built into Python and requires no external driver), you can safely open [requirements.txt](file:///c:/Users/Asus/OneDrive/Desktop/Student%20Connect/backend/requirements.txt), comment out the bottom line `# psycopg2-binary`, and run `pip install -r requirements.txt` again. Everything will install perfectly!
4. **Run the server**:
   ```bash
   uvicorn app.main:app --reload
   ```
   * The backend will run on `http://localhost:8000`.
   * The Interactive API Documentation will be available at `http://localhost:8000/docs`.
   * **Note**: By default, the application will create a local `career_portal.db` SQLite file in the backend folder. You do not need to install PostgreSQL locally for initial testing!

---

### B. Start the React Frontend
1. **Open a new terminal window** and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
   * The frontend will start on `http://localhost:5173`.
   * Open the link in your browser, and you are ready to test!

---

## 2. Deploying the Backend to Render

Render is an excellent platform for deploying FastAPI apps and hosting managed PostgreSQL databases.

### Step 1: Create a PostgreSQL Database on Render
1. Sign in to [Render](https://render.com/).
2. Click **New** (top right) and select **PostgreSQL**.
3. Configure your database:
   * **Name**: `career-portal-db`
   * **Region**: Choose the region closest to you.
   * **Plan**: Free
4. Click **Create Database**.
5. Once active, locate the **External Database URL** (for local testing if desired) and the **Internal Database URL** (which we will use for the backend service).

### Step 2: Deploy the FastAPI App
1. Push your code repository to GitHub/GitLab.
2. On the Render Dashboard, click **New** and select **Web Service**.
3. Connect your Git repository.
4. Configure the Web Service:
   * **Name**: `career-guidance-api`
   * **Environment**: `Python`
   * **Root Directory**: `backend` (Crucial! This tells Render the backend resides in the subfolder).
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Set Environment Variables**:
   Click the **Advanced** button and add these keys:
   * `DATABASE_URL`: *Paste the **Internal Database URL** of your Render PostgreSQL instance created in Step 1.*
   * `JWT_SECRET`: *Generate a strong secret key (e.g., `openssl rand -hex 32` or any long random string).*
6. Click **Create Web Service**. Render will build and deploy your backend. Copy your service's live URL (e.g., `https://career-guidance-api.onrender.com`).

---

## 3. Deploying the Frontend to Vercel

Vercel is designed for lightning-fast deployments of static sites and React single-page applications.

### Deploy the React App
1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New** and select **Project**.
3. Import your Git repository containing the codebase.
4. Configure the Vercel Project:
   * **Framework Preset**: `Vite` (Vercel automatically detects this).
   * **Root Directory**: Click *Edit* and select the **`frontend`** directory (Crucial! Enforces build in the frontend subfolder).
   * **Build and Output Settings**: Default commands (`npm run build` and output directory `dist`) are already configured perfectly.
5. **Set Environment Variables**:
   Under the **Environment Variables** accordion, add the following key:
   * `VITE_API_URL`: *Paste your Render Backend Web Service live URL (e.g., `https://career-guidance-api.onrender.com`).*
6. Click **Deploy**. Vercel will install dependencies, compile assets, and publish your site!

> [!NOTE]
> The included [vercel.json](file:///c:/Users/Asus/OneDrive/Desktop/Student%20Connect/frontend/vercel.json) file handles all SPA URL rewrite settings automatically, preventing `404 Not Found` responses when refreshing routes like `/dashboard` on Vercel.
