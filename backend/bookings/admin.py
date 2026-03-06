from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'event', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'event')
    search_fields = ('user__username', 'event__title')
