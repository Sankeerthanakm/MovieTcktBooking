import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                <Ticket size={28} color="var(--primary)" />
                Eventix
            </Link>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {user ? (
                    <>
                        <span style={{ color: 'var(--text-muted)' }}>Hello, {user.username}</span>
                        <Link to="/dashboard" className="btn-outline" style={{ padding: '0.5rem 1rem' }}>Dashboard</Link>
                        <button onClick={handleLogout} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn-outline" style={{ padding: '0.5rem 1rem' }}>Log In</Link>
                        <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
