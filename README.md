# e-rezervace-jih-vitkovice

## venv
- windows

```
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
/
Set-ExecutionPolicy RemoteSigned

python -m venv venv
.\venv\Scripts\Activate

#start server
daphne -b localhost -p 8000 trznice.asgi:application
```



## django command that will use barebones settings.py for basic work
```python manage.py runserver --settings=trznice.base_settings```

# Django Management Commands

| Command | Description | Example |
|---------|-------------|---------|
| `startproject <name>` | Create a new Django project | `python manage.py startproject myproject` |
| `startapp <name>` | Create a new Django app | `python manage.py startapp myapp` |
| `runserver [port]` | Run the development server (default: `8000`) | `python manage.py runserver 8080` |
| `migrate` | Apply database migrations | `python manage.py migrate` |
| `makemigrations [app]` | Create migration files for an app | `python manage.py makemigrations myapp` |
| `createsuperuser` | Create an admin superuser | `python manage.py createsuperuser` |
| `check` | Check for any project errors | `python manage.py check` |
| `shell` | Open the Django shell | `python manage.py shell` |
| `dbshell` | Open the database shell | `python manage.py dbshell` |
| `collectstatic` | Collect static files for deployment | `python manage.py collectstatic` |
| `test [app]` | Run tests for an app | `python manage.py test myapp` |
| `sqlmigrate <app> <migration>` | Show the SQL of a migration | `python manage.py sqlmigrate myapp 0001_initial` |
| `flush` | Reset the database (removes all data) | `python manage.py flush` |
| `dumpdata [app]` | Export database data as JSON | `python manage.py dumpdata myapp > data.json` |
| `loaddata <file>` | Load data from a JSON file | `python manage.py loaddata data.json` |
| `help` | Show available commands | `python manage.py help` |

Feel free to use or modify this table for your project!



## docker compose
 spuštění dockeru pro lokální hosting, s instantníma změnami během editace ve vscodu.
 ```docker compose up --build```

## dns reset windows
```ipconfig /flushdns```

# NPM

```
cd frontend
npm config set strict-ssl false
npm install --progress=false --cache

npm install vite --save-de
npm install -g npm@11.4.2

npm i react-router-dom

npm run dev
```
```ipconfig /flushdns```
