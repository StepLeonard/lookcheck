# LookCheck

Face & outfit scanner app — test version with randomized responses.

## Project Structure

```
lookcheck/
  backend/    → Express API (deploy to Render)
  frontend/   → React app (deploy to Netlify)
```

---

## Backend — Deploy to Render

1. Push `backend/` to a GitHub repo (can be a monorepo)
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repo, set **Root Directory** to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variable: `PORT = 3001` (Render will override with its own port automatically)
7. Deploy — you'll get a URL like `https://lookcheck-api.onrender.com`

---

## Frontend — Deploy to Netlify

1. Push `frontend/` to GitHub
2. Go to [netlify.com](https://netlify.com) → Add new site → Import from Git
3. Set **Base directory** to `frontend`
4. Build command: `npm run build`
5. Publish directory: `build`
6. Under **Environment variables**, add:
   ```
   REACT_APP_API_URL = https://your-render-url.onrender.com
   ```
7. Deploy

---

## Running Locally

**Backend:**
```bash
cd backend
npm install
npm start
# Runs on http://localhost:3001
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
npm start
# Runs on http://localhost:3000
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| POST | /analyze/face | Analyze a face photo (sends base64 image) |
| POST | /analyze/outfit | Analyze an outfit photo (sends base64 image) |

### Example Response

```json
{
  "type": "face",
  "tier": "great",
  "verdict": "LOOKING FIRE 🔥",
  "score": 93,
  "summary": "Your look is on point today.",
  "details": ["Skin is glowing...", "Symmetry is strong..."],
  "tip": "Keep that lighting..."
}
```

---

## Next Steps (Phase 2)

- Connect Claude Vision API to do real image analysis
- Add Neon DB to log scans + track history
- Add user auth (Clerk or Supabase Auth)
- Build a history/feed page
