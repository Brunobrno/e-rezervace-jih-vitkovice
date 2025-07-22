import os
import django
import random
from faker import Faker
from decimal import Decimal
from datetime import datetime, timedelta
from django.core.exceptions import ValidationError

# Nastavení Django prostředí
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "trznice.settings")
django.setup()

from booking.models import Square, Event, MarketSlot, Reservation
from account.models import CustomUser

fake = Faker("cs_CZ")

def create_users(n=10):
    roles = ['admin', 'seller', 'squareManager', 'cityClerk', 'checker', None]
    users = []
    for _ in range(n):
        first_name = fake.first_name()
        last_name = fake.last_name()
        role = random.choice(roles)
        email = fake.unique.email()

        user = CustomUser(
            first_name=first_name,
            last_name=last_name,
            email=email,
            role=role,
            is_active=True,
        )
        user.username = user.generate_login(first_name, last_name)
        user.set_password("password123")
        user.save()
        print(f"Vytvořen uživatel: {user.email} ({role})")
        users.append(user)
    print(f"✅ Vytvořeno {len(users)} uživatelů")
    return users

def create_squares(n=3):
    squares = []
    for _ in range(n):
        sq = Square.objects.create(
            name=fake.city() + " náměstí",
            description=fake.text(max_nb_chars=200),
            street=fake.street_name(),
            city=fake.city(),
            psc=int(fake.postcode().replace(" ", "")),  # odstraní mezery z PSČ
            width=random.randint(20, 50),
            height=random.randint(20, 50),
            grid_rows=random.randint(40, 60),
            grid_cols=random.randint(40, 60),
            cellsize=10,
        )
        squares.append(sq)
    print(f"✅ Vytvořeno {len(squares)} náměstí")
    return squares

def create_events(squares, n=5):
    events = []
    attempts = 0
    while len(events) < n and attempts < n * 5:
        sq = random.choice(squares)
        start = datetime.now() + timedelta(days=random.randint(1, 60))
        end = start + timedelta(days=random.randint(1, 5))

        # Kontrola kolizí
        overlap = Event.objects.filter(
            square=sq,
            start__lt=end,
            end__gt=start,
        ).exists()

        if overlap:
            attempts += 1
            continue  # koliduje – zkus jiný termín

        try:
            event = Event.objects.create(
                name=fake.catch_phrase(),
                description=fake.text(max_nb_chars=300),
                square=sq,
                start=start,
                end=end,
                price_per_m2=Decimal(f"{random.randint(10, 100)}.00")
            )
            events.append(event)
        except ValidationError as e:
            print(f"❌ Validace selhala: {e}")
            continue
    print(f"✅ Vytvořeno {len(events)} eventů")
    return events

def create_market_slots(events, max_slots=10):
    slots = []
    for event in events:
        count = random.randint(3, max_slots)
        for _ in range(count):
            slot = MarketSlot.objects.create(
                event=event,
                status=random.choice(["empty", "blocked", "taken"]),
                base_size=round(random.uniform(2, 10), 2),
                available_extension=round(random.uniform(0, 5), 2),
                x=random.randint(0, 30),
                y=random.randint(0, 30),
                width=random.randint(2, 10),
                height=random.randint(2, 10),
                price_per_m2=Decimal(f"{random.randint(10, 100)}.00")
            )
            slots.append(slot)
    print(f"✅ Vytvořeno {len(slots)} prodejních míst")
    return slots

def create_reservations(users, slots, max_per_user=3):
    reservations = []
    for user in users:
        user_slots = random.sample(slots, k=min(len(slots), max_per_user))
        for slot in user_slots:
            event = slot.event
            start = event.start + timedelta(hours=random.randint(0, 12))
            end = start + timedelta(days=1)
            try:
                res = Reservation.objects.create(
                    event=event,
                    marketSlot=slot,
                    user=user,
                    used_extension=round(random.uniform(0, slot.available_extension), 2),
                    reserved_from=start,
                    reserved_to=end,
                    status="reserved",
                    final_price=slot.price_per_m2 * Decimal(slot.base_size),
                )
                reservations.append(res)
            except Exception as e:
                print(f"❌ Chyba při vytváření rezervace: {e}")
    print(f"✅ Vytvořeno {len(reservations)} rezervací")
    return reservations

if __name__ == "__main__":
    users = create_users(10)
    squares = create_squares(3)
    events = create_events(squares, 7)
    slots = create_market_slots(events, max_slots=8)
    reservations = create_reservations(users, slots, max_per_user=2)
    print("🎉 Naplnění databáze dokončeno.")
