import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { CreatePasteResponse } from '../services/api';

interface ShareLinkProps {
    paste: CreatePasteResponse;
    onCreateAnother: () => void;
}

function ShareLink({ paste, onCreateAnother }: ShareLinkProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(paste.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const formatExpiration = () => {
        if (!paste.expiresAt) return 'Never expires';
        const date = new Date(paste.expiresAt);
        return `Expires: ${date.toLocaleString()}`;
    };

    return (
        <div className="card fade-in">
            <div className="card-body" style={{ textAlign: 'center' }}>
                {/* Success Icon */}
                <div
                    style={{
                        width: '56px',
                        height: '56px',
                        margin: '0 auto 1rem',
                        backgroundColor: '#dcfce7',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>

                {/* Title */}
                <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Paste Created!
                </h2>
                <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {paste.title}
                </p>

                {/* URL Input */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input
                        type="text"
                        value={paste.url}
                        readOnly
                        className="input-field"
                        style={{ flex: 1, textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem' }}
                    />
                    <button
                        onClick={handleCopy}
                        className={`btn ${copied ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ minWidth: '80px' }}
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>

                {/* Info */}
                <p style={{ margin: '0 0 1.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {formatExpiration()}
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <Link
                        to={`/${paste.id}`}
                        className="btn btn-secondary"
                    >
                        View Paste →
                    </Link>
                    <button onClick={onCreateAnother} className="btn btn-primary">
                        Create Another
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ShareLink;
