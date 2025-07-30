# Copilot Instructions for e-rezervace-jih-vitkovice

## Project Overview
- **Monorepo**: Contains a Django backend (`backend/`) and a React (Vite) frontend (`frontend/`).
- **Backend**: Django project with multiple apps (e.g., `account`, `booking`, `commerce`, `product`, `servicedesk`, `trznice`). Uses ASGI (Daphne) for serving, and Docker for local development.
- **Frontend**: React app using Vite, with modular structure under `src/` (e.g., `components/`, `pages/`, `api/`).

## Key Workflows
- **Backend (Django)**:
  - Activate venv: `.\venv\Scripts\Activate` (Windows)
  - Start server: `daphne -b localhost -p 8000 trznice.asgi:application`
  - Alternative: `python manage.py runserver --settings=trznice.base_settings`
  - Migrations: `python manage.py makemigrations`, `python manage.py migrate`
  - Tests: `python manage.py test <app>`
  - Logging: Use `logging.getLogger(__name__)` (not `print`) for Docker compatibility
- **Frontend (React/Vite)**:
  - Standard Vite/React setup; see `frontend/README.md` for details
  - ESLint config in `frontend/eslint.config.js`

## Patterns & Conventions
- **Backend**:
  - Each Django app has its own `models.py`, `serializers.py`, `views.py`, etc.
  - API endpoints and business logic are organized by app
  - Use `populate_db.py` for seeding data
  - Static/media files: `globalstaticfiles/`, `media/`
- **Frontend**:
  - Components are grouped by feature (e.g., `reservation/Step3Map.jsx`)
  - API calls abstracted in `src/api/model/`
  - Use `useDebouncedCallback` for debounced actions (see `Step3Map.jsx`)
  - State is often lifted to parent and passed via props

## Integration Points
- **Frontend ↔ Backend**: REST API, endpoints defined in Django apps, consumed via `frontend/src/api/model/`
- **Docker**: Use `docker-compose.yml` for local orchestration; run with `docker compose up --build`
- **Nginx**: Config in `frontend/nginx.conf` for serving frontend/static assets

## Examples
- **Slot selection logic**: See `frontend/src/components/reservation/Step3Map.jsx` for multi/single select patterns and debounced API calls
- **Django logging**: Use `logger = logging.getLogger(__name__)` and `logger.debug()`
- **Management commands**: Place custom commands in `backend/<app>/management/commands/`

## Troubleshooting
- **DNS issues (Windows)**: `ipconfig /flushdns`
- **Static files**: Use `python manage.py collectstatic` before deployment

---

For more details, see `README.md` in the root and `frontend/` directories.
