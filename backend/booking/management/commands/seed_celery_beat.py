# yourapp/management/commands/seed_celery_beat.py
import json
from django.utils import timezone
from django.core.management.base import BaseCommand
from django_celery_beat.models import PeriodicTask, IntervalSchedule, CrontabSchedule

class Command(BaseCommand):
    help = "Seeds the database with predefined Celery Beat tasks."

    def handle(self, *args, **kwargs):
        # # Example 1 — Run every 10 minutes
        # schedule, _ = IntervalSchedule.objects.get_or_create(
        #     every=10,
        #     period=IntervalSchedule.MINUTES,
        # )

        # Example 2 — Run each 5 minutes
        crontab_delete_unpayed, _ = CrontabSchedule.objects.get_or_create(
            minute='*/5',
            hour='*',
            day_of_week='*',
            day_of_month='*',
            month_of_year='*',
            timezone=timezone.get_current_timezone_name(),
        )

        PeriodicTask.objects.get_or_create(
            name='Zrušení nezaplacených rezervací',
            task='booking.tasks.cancel_unpayed_reservations_task',
            crontab=crontab_delete_unpayed,
            args=json.dumps([]),  # Optional arguments
            kwargs=json.dumps({"minutes": 30}),
            description="Maže Rezervace podle Objednávky, pokud ta nebyla zaplacena v době 30 minut. Tím se uvolní Prodejní Místa pro nové rezervace.\nJako vstupní argument může být zadán počet minut, podle kterého nezaplacená rezervaace bude stornovana."
        )

        
        crontab_delete_soft, _ = CrontabSchedule.objects.get_or_create(
            minute='0',
            hour='1',
            day_of_week='*',
            day_of_month='1',
            month_of_year='*',
            timezone=timezone.get_current_timezone_name(),
        )

        PeriodicTask.objects.get_or_create(
            name='Skartace soft-smazaných záznamů',
            task='booking.tasks.hard_delete_soft_deleted_records_task',
            crontab=crontab_delete_soft,
            args=json.dumps([]),  # Optional arguments
            kwargs=json.dumps({"years": 10, "days": 0}),  # Optional kwargs
            description="Mazání všech záznamů označených jako smazané v databázi.\nJako vstupní argument lze zadat počet let nebo dnů, podle kterého se určí, jak staré záznamy budou trvale odstraněny."
        )

        self.stdout.write(self.style.SUCCESS("✅ Celery Beat tasks have been seeded."))
