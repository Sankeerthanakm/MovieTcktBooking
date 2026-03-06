import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import api from '../api/axios';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const res = await api.get(`events/${searchQuery ? `?search=${searchQuery}` : ''}`);
                setEvents(res.data);
            } catch (err) {
                setError('Failed to load events.');
            } finally {
                setLoading(false);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchEvents();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    return (
        <div className="container animate-fade-in">
            <div style={{ textAlign: 'center', margin: '4rem 0' }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '700', marginBottom: '1rem', background: 'linear-gradient(to right, #ec4899, #6366f1)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                    Discover the Best Events
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto', marginBottom: '3rem' }}>
                    Book tickets for movies, concerts, and live shows in your city with an immersive experience.
                </p>

                {/* Search Bar */}
                <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search for events, artists, or venues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem 1.5rem',
                            borderRadius: '2rem',
                            border: '1px solid var(--border)',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            fontSize: '1.1rem',
                            outline: 'none',
                            transition: 'border-color 0.3s ease',
                            boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading events...</div>
            ) : error ? (
                <div style={{ textAlign: 'center', color: 'var(--error)' }}>{error}</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', paddingBottom: '4rem' }}>
                    {events.map((event) => (
                        <Link to={`/events/${event.id}`} key={event.id} className="glass-panel" style={{ display: 'block', overflow: 'hidden', transition: 'transform 0.3s ease', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ height: '200px', background: 'rgba(255, 255, 255, 0.05)', position: 'relative' }}>
                                {event.image_url ? (
                                    <img src={event.image_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No Image</div>
                                )}
                                <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(15, 23, 42, 0.8)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: '600', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    ₹{event.base_price}
                                </div>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>{event.title}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Calendar size={16} color="var(--primary)" />
                                        {new Date(event.date).toLocaleString()}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <MapPin size={16} color="var(--accent)" />
                                        {event.venue}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
