import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getPaste } from '../services/api';
import type { PasteApiResponse } from '../services/api';

function Paste() {
    const { id } = useParams();
    const [paste, setPaste] = useState<PasteApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;

        const fetchPaste = async () => {
            if (!id) return;

            try {
                // GET /api/pastes/:id now increments view count automatically
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

    const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

    const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

    useEffect(() => {
        const updateTime = () => {
            if (!paste?.expires_at) {
                setTimeRemaining(null);
                return;
            }

            const now = new Date();
            const expires = new Date(paste.expires_at);
            const diff = expires.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeRemaining('Expired');
                setError('This paste has expired.');
                setPaste(null);
                return;
            }

            const seconds = Math.floor((diff / 1000) % 60);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));

            const parts = [];
            if (days > 0) parts.push(`${days}d`);
            if (hours > 0) parts.push(`${hours}h`);
            if (minutes > 0) parts.push(`${minutes}m`);
            parts.push(`${seconds}s`);

            setTimeRemaining(parts.join(' ') + ' remaining');
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);

        return () => clearInterval(interval);
    }, [paste?.expires_at]);

    const handleCopy = async () => {
        if (!paste) return;
        try {
            await navigator.clipboard.writeText(paste.content);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

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
                    <div className="card fade-in">
                        {/* Header */}
                        <div
                            className="card-header"
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                gap: '1rem',
                                flexWrap: 'wrap',
                            }}
                        >
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    Paste {id}
                                </h1>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={handleCopy}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                                >
                                    Copy
                                </button>
                                <Link to="/" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                                    + New
                                </Link>
                            </div>
                        </div>

                        {/* Info badges */}
                        <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {timeRemaining ? (
                                <span className="badge-info">{timeRemaining}</span>
                            ) : paste.expires_at ? (
                                <span className="badge-info">Expires: {formatDate(paste.expires_at)}</span>
                            ) : (
                                <span className="badge-success">Never expires</span>
                            )}
                            {paste.remaining_views !== null && (
                                <span className="badge-info">Remaining views: {paste.remaining_views}</span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="code-block" style={{ margin: '1.5rem', borderRadius: '0.5rem' }}>
                            <div className="code-block-header">
                                <span>{paste.content.split('\n').length} lines • {paste.content.length.toLocaleString()} characters</span>
                            </div>
                            <pre className="code-block-content">{paste.content}</pre>
                        </div>
                    </div>
                ) : null}
            </main>

            <Footer />
        </div>
    );
}

export default Paste;
