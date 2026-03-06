from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, SeatViewSet

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='events')
router.register(r'seats', SeatViewSet, basename='seats')

urlpatterns = [
    path('', include(router.urls)),
]
