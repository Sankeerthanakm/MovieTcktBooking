import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, CreditCard } from 'lucide-react';

const Checkout = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const event = state?.event;
    const selectedSeats = state?.selectedSeats;

    useEffect(() => {
        if (!event || !selectedSeats || selectedSeats.length === 0) {
            navigate('/');
        }
    }, [event, selectedSeats, navigate]);

    const totalAmount = selectedSeats?.reduce((sum, seat) => sum + parseFloat(seat.price), 0);

    const handlePayment = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Create a Booking Backend Record
            const bookingData = {
                event: event.id,
                seats: selectedSeats.map(s => s.id)
            };

            const bookingRes = await api.post('bookings/', bookingData);
            const bookingId = bookingRes.data.id;

            // 2. Request Stripe Checkout Session URL
            const sessionRes = await api.post('payments/create-stripe-session/', {
                booking_id: bookingId,
                base_url: window.location.origin
            });

            // 3. Redirect user to Stripe's secure hosted checkout page
            if (sessionRes.data.url) {
                window.location.href = sessionRes.data.url;
            } else {
                setError('Failed to load Stripe checkout session.');
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to initialize payment.');
            setLoading(false);
        }
    };

    if (!event || !selectedSeats) return null;

    return (
        <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', margin: '4rem auto' }}>
            <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '600px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '2rem', textAlign: 'center' }}>Checkout Summary</h2>

                {error && <div style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}

                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>{event.title}</h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Date & Time</span>
                        <span>{new Date(event.date).toLocaleString()}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Venue</span>
                        <span>{event.venue}</span>
                    </div>

                    <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Seats Selected ({selectedSeats.length})</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {selectedSeats.map(seat => (
                                <span key={seat.id} style={{ background: 'var(--primary)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                                    {seat.row}{seat.number}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>
                        <span>Total Payable</span>
                        <span style={{ color: 'var(--success)' }}>₹{totalAmount}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button onClick={handlePayment} disabled={loading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '1rem', fontSize: '1.1rem', background: '#635BFF' }}>
                        {loading ? 'Processing...' : (
                            <>
                                <CreditCard size={20} />
                                Pay ₹{totalAmount} Securely
                            </>
                        )}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <ShieldCheck size={16} color="var(--success)" />
                        Payments are securely processed by Stripe.
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Checkout;
