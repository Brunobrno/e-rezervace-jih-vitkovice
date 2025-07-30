import os
import django
import random
from faker import Faker
from decimal import Decimal
from datetime import datetime, timedelta
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal, ROUND_DOWN
from datetime import timedelta
import random

# Nastavení Django prostředí
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "trznice.settings")
django.setup()

from booking.models import Square, Event, MarketSlot, Reservation
from account.models import CustomUser

fake = Faker("cs_CZ")

def create_users(n=10):
    roles = ['admin', 'seller', 'squareManager', 'cityClerk', 'checker', None]
    account_types = ['company', 'individual']
    users = []

    for _ in range(n):
        first_name = fake.first_name()
        last_name = fake.last_name()
        role = random.choice(roles)
        email = fake.unique.email()

        # Generuj náhodné hodnoty
        prefix = random.choice(["601", "602", "603", "604", "605", "606", "607", "608", "720", "721", "722", "723", "724", "725", "730", "731", "732", "733", "734", "735", "736", "737", "738", "739"])
        phone_number = "+420" + prefix + ''.join([str(random.randint(0, 9)) for _ in range(6)])
        ico = fake.unique.msisdn()[0:8]
        rc = f"{fake.random_int(100000, 999999)}/{fake.random_int(100, 9999)}"
        psc = fake.postcode().replace(" ", "")[:5]
        bank_prefix = f"{random.randint(0, 999999)}-" if random.random() > 0.5 else ""
        bank_number = f"{random.randint(1000000000, 9999999999)}/0100"  # např. KB
        bank_account = f"{bank_prefix}{bank_number}"

        user = CustomUser(
            first_name=first_name,
            last_name=last_name,
            email=email,
            role=role,
            account_type=random.choice(account_types),
            phone_number=phone_number,
            ICO=ico,
            RC=rc,
            city=fake.city(),
            street=fake.street_name() + " " + str(fake.building_number()),
            PSC=psc,
            GDPR=True,
            email_verified=random.choice([True, False]),
            bank_account=bank_account,
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

from django.utils import timezone

def create_reservations(users, slots, max_per_user=3):
    reservations = []

    for user in users:
        # max 5 rezervací dle validace, proto méně než 5
        max_res_for_user = min(max_per_user, 5)

        # vyber náhodně market sloty (nebo opakuj, pokud má uživatel méně slotů než max)
        user_slots = random.sample(slots, k=min(len(slots), max_res_for_user))

        for slot in user_slots:
            event = slot.event

            # Ujisti se, že event.start a event.end jsou aware
            event_start = event.start
            event_end = event.end
            if timezone.is_naive(event_start):
                event_start = timezone.make_aware(event_start)
            if timezone.is_naive(event_end):
                event_end = timezone.make_aware(event_end)

            # Délky rezervace povolené validací
            allowed_durations = [1, 7, 30]
            duration_days = random.choice(allowed_durations)

            # Vytvoř start rezervace tak, aby rezervace nepřesáhla konec eventu
            max_start = event_end - timedelta(days=duration_days)
            if max_start <= event_start:
                # Pokud není prostor na rezervaci, přeskoč
                continue

            start = event_start + timedelta(
                seconds=random.randint(0, int((max_start - event_start).total_seconds()))
            )
            end = start + timedelta(days=duration_days)

            # Ujisti se, že start a end jsou aware
            if timezone.is_naive(start):
                start = timezone.make_aware(start)
            if timezone.is_naive(end):
                end = timezone.make_aware(end)

            used_extension = round(random.uniform(0, slot.available_extension), 2)

            # Spočítej a validuj finální cenu
            base_size = Decimal(str(slot.base_size))
            price_per_m2 = slot.price_per_m2
            final_price = (price_per_m2 * (base_size + Decimal(str(used_extension))) * Decimal(duration_days)).quantize(Decimal("0.01"))

            if final_price >= Decimal("1000000.00"):
                print(f"⚠️ Přeskočeno – cena přesahuje limit: {final_price}")
                continue

            # Zkontroluj, že uživatel má méně než 5 rezervací, aby validace prošla
            if user.user_reservations.count() >= 5:
                break

            try:
                res = Reservation.objects.create(
                    event=event,
                    marketSlot=slot,
                    user=user,
                    used_extension=used_extension,
                    reserved_from=start,
                    reserved_to=end,
                    status="reserved",
                    final_price=final_price,
                )
                reservations.append(res)
            except ValidationError as e:
                print(f"❌ Validace selhala při vytváření rezervace: {e}")
            except Exception as e:
                print(f"❌ Jiná chyba při vytváření rezervace pro uživatele {user.id} a slot {slot.id}: {e}")

    print(f"✅ Vytvořeno {len(reservations)} rezervací")
    return reservations


if __name__ == "__main__":
    users = create_users(10)
    squares = create_squares(3)
    events = create_events(squares, 7)
    slots = create_market_slots(events, max_slots=8)
    reservations = create_reservations(users, slots, max_per_user=2)
    print("🎉 Naplnění databáze dokončeno.")
