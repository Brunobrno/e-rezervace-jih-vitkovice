from django.contrib.sitemaps import Sitemap
from django.urls import get_resolver, reverse, NoReverseMatch
from booking.models import Event, Reservation

def get_named_urls():
    resolver = get_resolver()
    urls = []

    def traverse(patterns):
        for pattern in patterns:
            if hasattr(pattern, "url_patterns"):
                # rekurzivně jdi hlouběji (include)
                traverse(pattern.url_patterns)
            else:
                name = getattr(pattern, "name", None)
                if name:
                    try:
                        url = reverse(name)
                        urls.append(url)
                    except NoReverseMatch:
                        # URL vyžaduje argumenty, přeskoč
                        pass
    traverse(resolver.url_patterns)
    return urls

class AutoSitemap(Sitemap):
    priority = 0.5
    changefreq = 'monthly'

    def items(self):
        static_urls = get_named_urls()

        # dynamické URL pro modely
        event_urls = []
        try:
            event_urls = [reverse('event-detail', args=[event.pk]) for event in Event.objects.all()]
        except NoReverseMatch:
            pass

        reservation_urls = []
        try:
            reservation_urls = [reverse('reservation-detail', args=[res.pk]) for res in Reservation.objects.filter(status="reserved")]
        except NoReverseMatch:
            pass

        return static_urls + event_urls + reservation_urls

    def location(self, item):
        return item
