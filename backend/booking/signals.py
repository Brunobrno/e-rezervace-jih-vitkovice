from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from booking.models import ReservationCheck

@receiver([post_save, post_delete], sender=ReservationCheck)
def update_reservation_check_status(sender, instance, **kwargs):
    reservation = instance.reservation
    reservation.update_check_status()
    reservation.save(update_fields=["is_checked", "last_checked_at", "last_checked_by"])
