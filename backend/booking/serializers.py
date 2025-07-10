from rest_framework import serializers
from .models import Event, Cell, Reservation
from account.models import CustomUser  # dle tvé struktury

# 1. Event
class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'  # nebo vyjmenovat: ['id', 'name', 'description', ...]

# 2. Cell
class CellSerializer(serializers.ModelSerializer):
    event = serializers.PrimaryKeyRelatedField(read_only=True)  # nebo allow editing if needed

    class Meta:
        model = Cell
        fields = '__all__'

# 3. Reservation
class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = '__all__'

    def validate(self, data):
        seller = data['seller']
        cell = data['cell']
        event = cell.event

        # Max 5 cells check
        existing = Reservation.objects.filter(seller=seller, cell__event=event)
        # if self.instance:
        #     existing = existing.exclude(pk=self.instance.pk)
        if existing.count() >= 5:
            raise serializers.ValidationError("Lze rezervovat maximálně 5 míst pro jednu akci.")
        return data
