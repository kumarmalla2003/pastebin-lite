import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { PasteResponse } from '../services/api';

interface ViewPasteProps {
    paste: PasteResponse;
    onExpire?: () => void;
}

function ViewPaste({ paste, onExpire }: ViewPasteProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(paste.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

    const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

    useEffect(() => {
        const updateTime = () => {
            if (!paste.expiresAt) {
                setTimeRemaining(null);
                return;
            }

            const now = new Date();
            const expires = new Date(paste.expiresAt);
            const diff = expires.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeRemaining('Expired');
                if (onExpire) onExpire();
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
    }, [paste.expiresAt]);

    return (
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
                        {paste.title || 'Untitled Paste'}
                    </h1>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        Created: {formatDate(paste.createdAt)}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={handleCopy}
                        className={`btn ${copied ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                    >
                        {copied ? 'Copied!' : 'Copy'}
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
                ) : (
                    <span className="badge-success">Never expires</span>
                )}
                <span className="badge-info">Views: {paste.viewCount}</span>
            </div>

            {/* Content */}
            <div className="code-block" style={{ margin: '1.5rem', borderRadius: '0.5rem' }}>
                <div className="code-block-header">
                    <span>{paste.content.split('\n').length} lines • {paste.content.length.toLocaleString()} characters</span>
                </div>
                <pre className="code-block-content">{paste.content}</pre>
            </div>
        </div>
    );
}

export default ViewPaste;
