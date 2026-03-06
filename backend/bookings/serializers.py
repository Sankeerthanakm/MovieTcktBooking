from rest_framework import serializers
from .models import Booking
from events.models import Seat
from users.serializers import UserSerializer
from events.serializers import EventSerializer, SeatSerializer

class BookingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    event_details = EventSerializer(source='event', read_only=True)
    seat_details = SeatSerializer(source='seats', many=True, read_only=True)
    seats = serializers.PrimaryKeyRelatedField(
        queryset=Seat.objects.all(), many=True, write_only=True
    )

    class Meta:
        model = Booking
        fields = ('id', 'user', 'event', 'event_details', 'seats', 'seat_details', 'total_amount', 'status', 'created_at')
        read_only_fields = ('total_amount', 'status', 'user')

    def create(self, validated_data):
        seats = validated_data.pop('seats')
        event = validated_data['event']
        
        total_amount = sum(seat.price for seat in seats)
        # Check seat availability
        for seat in seats:
            if seat.status != 'AVAILABLE':
                raise serializers.ValidationError(f"Seat {seat.row}{seat.number} is not available.")
            if seat.event != event:
                raise serializers.ValidationError(f"Seat {seat.row}{seat.number} does not belong to this event.")
        
        # Mark seats as reserved pending payment
        for seat in seats:
            seat.status = 'RESERVED'
            seat.save()
            
        booking = Booking.objects.create(
            user=self.context['request'].user,
            total_amount=total_amount,
            **validated_data
        )
        booking.seats.set(seats)
        return booking
