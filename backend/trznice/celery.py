import os
from celery import Celery

# Nastav environment variable pro Django settings modul
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trznice.settings')

app = Celery('trznice')

# Načti konfiguraci z Django settings (prefix "CELERY_")
app.config_from_object('django.conf:settings', namespace='CELERY')

# Automaticky najdi tasks.py ve všech appkách
app.autodiscover_tasks()

# Optional but recommended for beat to use DB scheduler
# from django_celery_beat.schedulers import DatabaseScheduler