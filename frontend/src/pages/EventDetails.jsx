import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, CheckCircle, Info } from 'lucide-react';
import api from '../api/axios';

const EventDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const [eventRes, seatsRes] = await Promise.all([
                    api.get(`events/${id}/`),
                    api.get(`events/${id}/seats/`)
                ]);
                setEvent(eventRes.data);
                setSeats(seatsRes.data);
            } catch (err) {
                setError('Failed to load event details.');
            } finally {
                setLoading(false);
            }
        };
        fetchEventDetails();
    }, [id]);

    const toggleSeat = (seat) => {
        if (seat.status !== 'AVAILABLE') return;

        if (selectedSeats.find((s) => s.id === seat.id)) {
            setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
        } else {
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const handleCheckout = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        // Proceed to checkout page, passing selected seat IDs in state
        navigate(`/checkout/new`, { state: { event, selectedSeats } });
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading details...</div>;
    if (error) return <div style={{ textAlign: 'center', color: 'var(--error)', padding: '4rem' }}>{error}</div>;

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>

            {/* Event Header */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>{event.title}</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>{event.description}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem' }}>
                            <Calendar color="var(--primary)" />
                            {new Date(event.date).toLocaleString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem' }}>
                            <MapPin color="var(--accent)" />
                            {event.venue}
                        </div>
                    </div>
                </div>
            </div>

            {/* Seat Selection */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>Select Your Seats</h2>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 20, height: 20, borderRadius: 4, background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border)' }}></div> Available</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 20, height: 20, borderRadius: 4, background: 'var(--primary)' }}></div> Selected</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 20, height: 20, borderRadius: 4, background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--error)' }}></div> Booked</div>
                </div>

                {/* Screen layout indicator */}
                <div style={{ width: '100%', height: '40px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)', borderRadius: '10px 10px 0 0', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', letterSpacing: '4px', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '3rem' }}>
                    <span style={{ background: 'var(--bg-dark)', padding: '0 10px' }}>Screen</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', maxWidth: '800px', margin: '0 auto' }}>
                    {seats.map((seat) => {
                        const isSelected = selectedSeats.find(s => s.id === seat.id);
                        const isAvailable = seat.status === 'AVAILABLE';

                        return (
                            <button
                                key={seat.id}
                                onClick={() => toggleSeat(seat)}
                                disabled={!isAvailable}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.2s ease',
                                    background: isSelected ? 'var(--primary)' : isAvailable ? 'rgba(255,255,255,0.05)' : 'rgba(239, 68, 68, 0.1)',
                                    border: isAvailable ? (isSelected ? '1px solid var(--primary-hover)' : '1px solid var(--border)') : '1px solid rgba(239, 68, 68, 0.3)',
                                    color: isAvailable ? 'white' : 'var(--error)',
                                    opacity: isAvailable ? 1 : 0.5
                                }}
                                title={`Row ${seat.row} No ${seat.number} - ₹${seat.price}`}
                            >
                                {seat.row}{seat.number}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Floating Checkout Bar */}
            {selectedSeats.length > 0 && (
                <div className="glass-panel animate-fade-in" style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '2rem', zIndex: 50, border: '1px solid var(--primary)', background: 'rgba(30, 41, 59, 0.9)' }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''} Selected</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>₹{selectedSeats.reduce((sum, seat) => sum + parseFloat(seat.price), 0)}</div>
                    </div>
                    <button onClick={handleCheckout} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={18} />
                        Continue to Booking
                    </button>
                </div>
            )}

        </div>
    );
};

export default EventDetails;
