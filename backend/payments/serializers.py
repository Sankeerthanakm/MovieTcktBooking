from rest_framework import serializers

class CreateStripeSessionSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    base_url = serializers.CharField(required=False, default='http://localhost:5173')

class VerifyStripeSerializer(serializers.Serializer):
    session_id = serializers.CharField()
