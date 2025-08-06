
# Renewed populate_db.py: fills all models with relations and validation
import os
import django
import random
from faker import Faker
from decimal import Decimal
from datetime import datetime, timedelta
from django.core.exceptions import ValidationError
from django.utils import timezone

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "trznice.settings")
django.setup()

from booking.models import Square, Event, MarketSlot, Reservation
from account.models import CustomUser
from product.models import Product, EventProduct
from commerce.models import Order
from servicedesk.models import ServiceTicket

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
        prefix = random.choice(["601", "602", "603", "604", "605", "606", "607", "608", "720", "721", "722", "723", "724", "725", "730", "731", "732", "733", "734", "735", "736", "737", "738", "739"])
        phone_number = "+420" + prefix + ''.join([str(random.randint(0, 9)) for _ in range(6)])
        ico = fake.unique.msisdn()[0:8]
        rc = f"{fake.random_int(100000, 999999)}/{fake.random_int(100, 9999)}"
        psc = fake.postcode().replace(" ", "")[:5]
        bank_prefix = f"{random.randint(0, 999999)}-" if random.random() > 0.5 else ""
        bank_number = f"{random.randint(1000000000, 9999999999)}/0100"
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
        user.full_clean()
        user.save()
        users.append(user)
    print(f"✅ Vytvořeno {len(users)} uživatelů")
    return users

def create_squares(n=3):
    squares = []
    for _ in range(n):
        sq = Square(
            name=fake.city() + " náměstí",
            description=fake.text(max_nb_chars=200),
            street=fake.street_name(),
            city=fake.city(),
            psc=int(fake.postcode().replace(" ", "")),
            width=random.randint(20, 50),
            height=random.randint(20, 50),
            grid_rows=random.randint(40, 60),
            grid_cols=random.randint(40, 60),
            cellsize=10,
        )
        sq.full_clean()
        sq.save()
        squares.append(sq)
    print(f"✅ Vytvořeno {len(squares)} náměstí")
    return squares

def create_events(squares, n=7):
    events = []
    attempts = 0
    while len(events) < n and attempts < n * 5:
        sq = random.choice(squares)
        start = datetime.now() + timedelta(days=random.randint(1, 60))
        end = start + timedelta(days=random.randint(1, 5))
        overlap = Event.objects.filter(square=sq, start__lt=end, end__gt=start).exists()
        if overlap:
            attempts += 1
            continue
        try:
            event = Event(
                name=fake.catch_phrase(),
                description=fake.text(max_nb_chars=300),
                square=sq,
                start=start,
                end=end,
                price_per_m2=Decimal(f"{random.randint(10, 100)}.00")
            )
            event.full_clean()
            event.save()
            events.append(event)
        except ValidationError as e:
            continue
    print(f"✅ Vytvořeno {len(events)} eventů")
    return events

def create_products(n=10):
    products = []
    for _ in range(n):
        name = fake.word().capitalize() + " " + fake.word().capitalize()
        code = random.randint(10000, 99999)
        product = Product(name=name, code=code)
        product.full_clean()
        product.save()
        products.append(product)
    print(f"✅ Vytvořeno {len(products)} produktů")
    return products

def create_event_products(events, products, n=15):
    event_products = []
    for _ in range(n):
        product = random.choice(products)
        event = random.choice(events)
        start = event.start + timedelta(days=random.randint(0, 1))
        end = min(event.end, start + timedelta(days=random.randint(1, 3)))
        # Ensure timezone-aware datetimes
        if timezone.is_naive(start):
            start = timezone.make_aware(start)
        if timezone.is_naive(end):
            end = timezone.make_aware(end)
        if timezone.is_naive(event.start):
            event_start = timezone.make_aware(event.start)
        else:
            event_start = event.start
        if timezone.is_naive(event.end):
            event_end = timezone.make_aware(event.end)
        else:
            event_end = event.end
        # Ensure end is not after event_end and start is not before event_start
        if start < event_start:
            start = event_start
        if end > event_end:
            end = event_end
        ep = EventProduct(
            product=product,
            event=event,
            start_selling_date=start,
            end_selling_date=end
        )
        try:
            ep.full_clean()
            ep.save()
            event_products.append(ep)
        except ValidationError as e:
            print(f"❌ EventProduct error: {e}")
            continue
    print(f"✅ Vytvořeno {len(event_products)} event produktů")
    return event_products

def create_market_slots(events, max_slots=8):
    slots = []
    for event in events:
        count = random.randint(3, max_slots)
        for _ in range(count):
            slot = MarketSlot(
                event=event,
                status=random.choice(["empty", "blocked"]),
                base_size=round(random.uniform(2, 10), 2),
                available_extension=round(random.uniform(0, 5), 2),
                x=random.randint(0, 30),
                y=random.randint(0, 30),
                width=random.randint(2, 10),
                height=random.randint(2, 10),
                price_per_m2=Decimal(f"{random.randint(10, 100)}.00")
            )
            slot.full_clean()
            slot.save()
            slots.append(slot)
    print(f"✅ Vytvořeno {len(slots)} prodejních míst")
    return slots

def create_reservations(users, slots, event_products, max_per_user=2):
    reservations = []
    for user in users:
        max_res_for_user = min(max_per_user, 5)
        user_slots = random.sample(slots, k=min(len(slots), max_res_for_user))
        for slot in user_slots:
            event = slot.event
            event_start = event.start
            event_end = event.end
            if timezone.is_naive(event_start):
                event_start = timezone.make_aware(event_start)
            if timezone.is_naive(event_end):
                event_end = timezone.make_aware(event_end)
            allowed_durations = [1, 7, 30]
            duration_days = random.choice(allowed_durations)
            max_start = event_end - timedelta(days=duration_days)
            if max_start <= event_start:
                continue
            start = event_start + timedelta(seconds=random.randint(0, int((max_start - event_start).total_seconds())))
            end = start + timedelta(days=duration_days)
            if timezone.is_naive(start):
                start = timezone.make_aware(start)
            if timezone.is_naive(end):
                end = timezone.make_aware(end)
            used_extension = round(random.uniform(0, slot.available_extension), 2)
            base_size = Decimal(str(slot.base_size))
            price_per_m2 = slot.price_per_m2
            final_price = (price_per_m2 * (base_size + Decimal(str(used_extension))) * Decimal(duration_days)).quantize(Decimal("0.01"))
            if final_price >= Decimal("1000000.00"):
                continue
            if user.user_reservations.count() >= 5:
                break
            try:
                res = Reservation(
                    event=event,
                    marketSlot=slot,
                    user=user,
                    used_extension=used_extension,
                    reserved_from=start,
                    reserved_to=end,
                    status="reserved",
                    final_price=final_price,
                )
                res.full_clean()
                res.save()
                # Add event_products to reservation
                if event_products:
                    chosen_eps = random.sample(event_products, k=min(len(event_products), random.randint(0, 2)))
                    res.event_products.add(*chosen_eps)
                reservations.append(res)
            except ValidationError:
                continue
    print(f"✅ Vytvořeno {len(reservations)} rezervací")
    return reservations

def create_orders(users, reservations):
    orders = []
    for res in reservations:
        user = res.user
        order = Order(
            user=user,
            reservation=res,
            status=random.choice(["payed", "pending", "cancelled"]),
            price_to_pay=res.final_price,
            note=fake.sentence(),
        )
        try:
            order.full_clean()
            order.save()
            orders.append(order)
        except ValidationError:
            continue
    print(f"✅ Vytvořeno {len(orders)} objednávek")
    return orders

def create_service_tickets(users, n=10):
    tickets = []
    for _ in range(n):
        user = random.choice(users)
        ticket = ServiceTicket(
            title=fake.sentence(nb_words=6),
            description=fake.text(max_nb_chars=200),
            user=user,
            status=random.choice(["new", "in_progress", "resolved", "closed"]),
            category=random.choice(["tech", "reservation", "payment", "account", "content", "suggestion", "other"]),
        )
        try:
            ticket.full_clean()
            ticket.save()
            tickets.append(ticket)
        except ValidationError:
            continue
    print(f"✅ Vytvořeno {len(tickets)} servisních tiketů")
    return tickets

if __name__ == "__main__":
    users = create_users(10)
    squares = create_squares(3)
    events = create_events(squares, 7)
    products = create_products(10)
    event_products = create_event_products(events, products, 15)
    slots = create_market_slots(events, max_slots=8)
    reservations = create_reservations(users, slots, event_products, max_per_user=2)
    orders = create_orders(users, reservations)
    tickets = create_service_tickets(users, 10)
    print("🎉 Naplnění databáze dokončeno.")
