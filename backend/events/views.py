from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Event, Seat
from .serializers import EventSerializer, SeatSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('date')
    serializer_class = EventSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'venue']

    @action(detail=True, methods=['get'])
    def seats(self, request, pk=None):
        event = self.get_object()
        seats = event.seats.all().order_by('row', 'number')
        serializer = SeatSerializer(seats, many=True)
        return Response(serializer.data)

class SeatViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Seat.objects.all()
    serializer_class = SeatSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['event', 'status']
