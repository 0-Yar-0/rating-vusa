# rating-university-web (frontend)

This is the Vite + React frontend.

## Local dev

Copy config (if needed):

- Create `.env.local` with:

  VITE_API_BASE=http://localhost:4000

Start dev server:

  npm install
  npm run dev

## Deploying to Render (Static Site)

1. Create a new **Static Site** on Render and connect your GitHub repo.
2. Set the environment variable in Render: `VITE_API_BASE` to your backend's full origin, e.g. `https://your-backend.onrender.com`.
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`

Notes:
- Vite inlines `VITE_*` variables at build time. Set `VITE_API_BASE` in the Render environment before building the static site.
- Ensure the backend `CLIENT_ORIGIN` environment variable matches your static site origin to allow cookies and CORS.
- The client uses `fetch(..., { credentials: 'include' })` so cookies will be sent along with requests if the backend sets them with proper SameSite and Secure flags.
