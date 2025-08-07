import os
from celery import Celery
from django.conf import settings

# Nastav environment variable pro Django settings modul
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trznice.settings')

app = Celery('trznice')

# Načti konfiguraci z Django settings (prefix "CELERY_")
app.config_from_object('django.conf:settings', namespace='CELERY')

# Automaticky najdi tasks.py ve všech appkách
# app.autodiscover_tasks()
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

# Optional but recommended for beat to use DB scheduler
# from django_celery_beat.schedulers import DatabaseScheduler