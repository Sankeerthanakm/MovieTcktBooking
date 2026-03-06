import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.core.mail import send_mail
from .models import Payment
from bookings.models import Booking
from events.models import Seat
from .serializers import CreateStripeSessionSerializer, VerifyStripeSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY

class CreateStripeSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = CreateStripeSessionSerializer(data=request.data)
        if serializer.is_valid():
            booking_id = serializer.validated_data['booking_id']
            base_url = serializer.validated_data.get('base_url', 'http://localhost:5173')
            try:
                booking = Booking.objects.get(id=booking_id, user=request.user)
            except Booking.DoesNotExist:
                return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)

            amount_in_paise = int(booking.total_amount * 100)
            
            try:
                checkout_session = stripe.checkout.Session.create(
                    payment_method_types=['card'],
                    line_items=[{
                        'price_data': {
                            'currency': 'inr',
                            'product_data': {
                                'name': booking.event.title,
                            },
                            'unit_amount': amount_in_paise,
                        },
                        'quantity': 1,
                    }],
                    mode='payment',
                    success_url=f'{base_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}',
                    cancel_url=f'{base_url}/',
                    metadata={
                        'booking_id': booking.id
                    }
                )
                
                Payment.objects.create(
                    booking=booking,
                    stripe_session_id=checkout_session.id,
                    amount=booking.total_amount,
                    status='PENDING'
                )
                
                return Response({'url': checkout_session.url}, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyStripeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = VerifyStripeSerializer(data=request.data)
        if serializer.is_valid():
            session_id = serializer.validated_data['session_id']

            try:
                payment = Payment.objects.get(stripe_session_id=session_id, booking__user=request.user)
            except Payment.DoesNotExist:
                return Response({'error': 'Payment record not found'}, status=status.HTTP_404_NOT_FOUND)

            try:
                session = stripe.checkout.Session.retrieve(session_id)
                if session.payment_status == 'paid':
                    payment.stripe_payment_intent = session.payment_intent
                    payment.status = 'SUCCESS'
                    payment.save()

                    booking = payment.booking
                    booking.status = 'CONFIRMED'
                    booking.save()

                    for seat in booking.seats.all():
                        seat.status = 'BOOKED'
                        seat.save()

                    # Send Email Confirmation
                    seat_numbers = ", ".join([f"{s.row}{s.number}" for s in booking.seats.all()])
                    try:
                        send_mail(
                            subject=f"Booking Confirmed: {booking.event.title}",
                            message=f"Hi {request.user.first_name},\n\nYour booking is confirmed!\n\nEvent: {booking.event.title}\nVenue: {booking.event.venue}\nDate: {booking.event.date.strftime('%d %b %Y, %I:%M %p')}\nSeats: {seat_numbers}\nAmount Paid: Rs {booking.total_amount}\n\nEnjoy the event!\nEventix Team",
                            from_email=settings.EMAIL_HOST_USER,
                            recipient_list=[request.user.email],
                            fail_silently=True,
                        )
                    except Exception as e:
                        print(f"Failed to send email: {e}")

                    return Response({'status': 'Payment verified and booking confirmed'})
                else:
                    payment.status = 'FAILED'
                    payment.save()
                    return Response({'error': 'Payment not completed'}, status=status.HTTP_400_BAD_REQUEST)
                    
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
