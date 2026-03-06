import os
import django
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from events.models import Event, Seat

events_data = [
    {
        "title": "Arijit Singh Live in Concert",
        "description": "Experience the soulful voice of Arijit Singh live in an unforgettable musical journey. The biggest musical night of the year is finally here.",
        "date": timezone.now() + timedelta(days=5, hours=10),
        "venue": "Jio World Drive, Mumbai",
        "base_price": 4999.00,
        "image_url": "https://images.unsplash.com/photo-1540039155732-d6749b9365c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" # Using generic concert image
    },
    {
        "title": "Sunburn Festival 2026",
        "description": "Asia's biggest electronic dance music festival returns with a massive lineup of international DJs.",
        "date": timezone.now() + timedelta(days=20, hours=5),
        "venue": "Vagator Beach, Goa",
        "base_price": 7500.00,
        "image_url": "https://images.unsplash.com/photo-1470229722913-7c090be5c5b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
    },
    {
        "title": "Standup Comedy: Zakir Khan",
        "description": "Get ready for a night of non-stop laughter with the Sakht Launda himself. Book your exclusive fast-filling tickets now!",
        "date": timezone.now() + timedelta(days=2, hours=4),
        "venue": "Siri Fort Auditorium, New Delhi",
        "base_price": 999.00,
        "image_url": "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" # Standup mic
    },
    {
        "title": "Avengers: Secret Wars Premiere",
        "description": "The highly anticipated Marvel crossover event of the decade. Experience it first on the biggest IMAX screen.",
        "date": timezone.now() + timedelta(days=12, hours=8),
        "venue": "PVR IMAX, Bangalore",
        "base_price": 650.00,
        "image_url": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" # Cinema
    },
    {
        "title": "Tech Conference: AI Forward 2026",
        "description": "Join industry leaders from Google, OpenAI, and Microsoft for deep-dives into the future of LLMs and GenAI applications.",
        "date": timezone.now() + timedelta(days=45, hours=3),
        "venue": "Hitex Exhibition Center, Hyderabad",
        "base_price": 12500.00,
        "image_url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" # Conference
    }
]

for ed in events_data:
    event, created = Event.objects.get_or_create(
        title=ed["title"],
        defaults={
            "description": ed["description"],
            "date": ed["date"],
            "venue": ed["venue"],
            "base_price": ed["base_price"],
            "image_url": ed["image_url"]
        }
    )
    if created:
        print(f"Created event: {event.title}")
        # Create Seats for this event (Rows A-E, Seats 1-6)
        rows = ['A', 'B', 'C', 'D', 'E']
        nums = [1, 2, 3, 4, 5, 6]
        for row in rows:
            for num in nums:
                # Add a bit of price variation for front rows
                seat_price = event.base_price
                if row in ['A', 'B']: # VIP / Front Rows
                    seat_price += 500
                    
                Seat.objects.create(
                    event=event,
                    row=row,
                    number=num,
                    price=seat_price,
                    status='AVAILABLE'
                )
        print(f"  -> Added 30 seats for {event.title}")
    else:
        print(f"Event already exists: {event.title}")

print("Database successfully seeded with realistic events!")
