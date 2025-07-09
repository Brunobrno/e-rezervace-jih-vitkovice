from rest_framework import serializers
from .models import Reservation

class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = '__all__'

    def validate(self, data):
        seller = data.get('seller')
        if seller and Reservation.objects.filter(seller=seller).count() >= 5:
            raise serializers.ValidationError("Tento prodejce již má maximální počet 5 rezervací.")
        return data
