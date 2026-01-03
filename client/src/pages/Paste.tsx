import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ViewPaste from '../components/ViewPaste';
import { getPaste, incrementView } from '../services/api';
import type { PasteResponse } from '../services/api';

function Paste() {
    const { id } = useParams();
    const [paste, setPaste] = useState<PasteResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;

        const fetchPaste = async () => {
            if (!id) return;

            try {
                // Increment view count FIRST and AWAIT completion
                // This ensures the view is registered in DB before we fetch
                await incrementView(id);

                // Fetch paste data - the viewCount already includes this view
                const data = await getPaste(id);

                if (isCancelled) return;

                setPaste(data);
            } catch (err: unknown) {
                if (err && typeof err === 'object' && 'response' in err) {
                    const axiosErr = err as { response?: { status?: number } };
                    if (axiosErr.response?.status === 404) {
                        setError('Paste not found, expired, or reached view limit');
                    } else {
                        setError('Failed to load paste');
                    }
                } else {
                    setError('Failed to load paste');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPaste();

        return () => {
            isCancelled = true;
        };
    }, [id]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <main className="container" style={{ flex: 1, paddingTop: '2rem', paddingBottom: '2rem' }}>
                {loading ? (
                    <div className="card fade-in">
                        <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
                            <div
                                className="spin"
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    margin: '0 auto 1rem',
                                    border: '3px solid var(--border-color)',
                                    borderTopColor: 'var(--accent-500)',
                                    borderRadius: '50%',
                                }}
                            />
                            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Loading paste...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="card fade-in">
                        <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
                            <div
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    margin: '0 auto 1rem',
                                    backgroundColor: '#fee2e2',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                            </div>
                            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {error}
                            </h2>
                            <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                This paste may have been deleted, or reached its view limit.
                            </p>
                            <Link to="/" className="btn btn-primary">
                                Create New Paste
                            </Link>
                        </div>
                    </div>
                ) : paste ? (
                    <ViewPaste
                        paste={paste}
                        onExpire={() => {
                            setPaste(null);
                            setError('This paste has expired recently.');
                        }}
                    />
                ) : null}
            </main>

            <Footer />
        </div>
    );
}

export default Paste;
