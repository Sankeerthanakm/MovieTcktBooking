from django.urls import path
from .views import CreateStripeSessionView, VerifyStripeView

urlpatterns = [
    path('create-stripe-session/', CreateStripeSessionView.as_view(), name='create-stripe-session'),
    path('verify-stripe/', VerifyStripeView.as_view(), name='verify-stripe'),
]
