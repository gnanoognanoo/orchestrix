# Orchestrix — Multi-Agent Research Intelligence Platform

Orchestrix is a high-end, multi-agent AI system designed to intelligently discover, analyze, and synthesize academic research. 

It features:
- **Discovery Agent**: Automatically fetches papers using Semantic Scholar API.
- **Analysis Agent**: Evaluates publication trends, citation distributions, and keyword frequency.
- **Synthesis Agent**: Leverages LLMs (Gemini API) to read and summarize multiple research papers.
- **Citation Agent**: Formats citations in APA, IEEE, MLA and generates bulk BibTeX exports.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS + Recharts
- Backend: FastAPI (Python) + Supabase
- AI: Google Gemini API

## Setup Instructions

### 1. Database Setup
1. Create a project on [Supabase](https://supabase.com).
2. Go to the SQL Editor in your Supabase dashboard and run the entire contents of `supabase_schema.sql`.

### 2. Environment Variables
1. Copy `.env.example` to `.env` in the root folder (`orchestrix/.env`).
2. Fill in:
   - `SUPABASE_URL`: Your Supabase Project URL.
   - `SUPABASE_KEY`: Your Supabase Anon Key.
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
3. Also create a `.env` in `frontend/.env` with:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

### 3. Start the Backend
```bash
# Don't cd into backend, stay in orchestrix root!
python -m venv backend/venv
# Windows: .\backend\venv\Scripts\activate | Mac/Linux: source backend/venv/bin/activate
pip install -r backend/requirements.txt
python -m backend.main
```
The FastAPI backend runs on `http://localhost:8000`.

### 4. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The interface runs on `http://localhost:5173`. Open it in your browser, search for a topic, and orchestrate research!
