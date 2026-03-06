from rest_framework import serializers
from .models import Event, Seat

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    available_seats = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = '__all__'

    def get_available_seats(self, obj):
        return obj.seats.filter(status='AVAILABLE').count()
