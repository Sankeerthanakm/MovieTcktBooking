from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('booking', 'amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('booking__user__username', 'razorpay_order_id', 'razorpay_payment_id')
