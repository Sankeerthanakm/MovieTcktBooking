import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ShieldCheck, XCircle } from 'lucide-react';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const session_id = searchParams.get('session_id');
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'

    useEffect(() => {
        if (!session_id) {
            navigate('/');
            return;
        }

        const verifyPayment = async () => {
            try {
                // Post session details back to django to confirm payment status is securely "paid"
                await api.post('payments/verify-stripe/', { session_id });
                setStatus('success');
                setTimeout(() => {
                    navigate('/dashboard', { state: { message: '🎊 Payment Successful! Your booking is confirmed.' } });
                }, 2000);
            } catch (err) {
                console.error(err);
                setStatus('error');
            }
        };

        verifyPayment();
    }, [session_id, navigate]);

    return (
        <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', margin: '6rem auto' }}>
            <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '500px', textAlign: 'center' }}>
                {status === 'verifying' && (
                    <>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Verifying Payment...</h2>
                        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                        <style>
                            {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
                        </style>
                    </>
                )}

                {status === 'success' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <ShieldCheck size={64} color="var(--success)" style={{ marginBottom: '1rem' }} />
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)', marginBottom: '0.5rem' }}>Payment Confirmed</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Redirecting to your dashboard...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <XCircle size={64} color="var(--error)" style={{ marginBottom: '1rem' }} />
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--error)', marginBottom: '0.5rem' }}>Verification Failed</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>We could not verify your payment via Stripe. Please check your Dashboard or hit go back.</p>
                        <button onClick={() => navigate('/dashboard')} className="btn-primary">View Dashboard</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
