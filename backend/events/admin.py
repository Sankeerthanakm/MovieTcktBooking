from django.contrib import admin
from .models import Event, Seat

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'venue', 'base_price')
    search_fields = ('title', 'venue')
    list_filter = ('date',)

@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ('event', 'row', 'number', 'status', 'price')
    list_filter = ('status', 'event')
    search_fields = ('row', 'number', 'event__title')
