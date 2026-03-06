import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import { Ticket, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const Dashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { state } = useLocation();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get('bookings/');
                setBookings(res.data);
            } catch (err) {
                setError('Failed to load your bookings.');
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'CONFIRMED': return <CheckCircle size={18} color="var(--success)" />;
            case 'CANCELLED': return <XCircle size={18} color="var(--error)" />;
            default: return <Clock size={18} color="#eab308" />; // Pending
        }
    };

    return (
        <div className="container animate-fade-in" style={{ margin: '4rem auto', paddingBottom: '4rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem' }}>My Bookings</h1>

            {state?.message && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    {state.message}
                </div>
            )}

            {loading ? (
                <div style={{ color: 'var(--text-muted)' }}>Loading bookings...</div>
            ) : error ? (
                <div style={{ color: 'var(--error)' }}>{error}</div>
            ) : bookings.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Ticket size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>No bookings found</h3>
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>You haven't booked any tickets yet. Explore events and book your first ticket!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {bookings.map((booking) => (
                        <div key={booking.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between', borderLeft: booking.status === 'CONFIRMED' ? '4px solid var(--success)' : booking.status === 'CANCELLED' ? '4px solid var(--error)' : '4px solid #eab308' }}>

                            <div style={{ flex: '1', minWidth: '250px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>{booking.event_details?.title}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    <Calendar size={16} />
                                    {new Date(booking.event_details?.date).toLocaleString()}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    Venue: {booking.event_details?.venue}
                                </div>
                            </div>

                            <div style={{ flex: '1', minWidth: '150px' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Seats</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                    {booking.seat_details?.map(seat => (
                                        <span key={seat.id} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                            {seat.row}{seat.number}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ textAlign: 'right', minWidth: '120px' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>₹{booking.total_amount}</div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', fontSize: '0.85rem', color: booking.status === 'CONFIRMED' ? 'var(--success)' : booking.status === 'CANCELLED' ? 'var(--error)' : '#eab308' }}>
                                    {getStatusIcon(booking.status)}
                                    {booking.status}
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
