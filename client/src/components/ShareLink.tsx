import { useState } from 'react';
import { CreatePasteResponse } from '../services/api';

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
        <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>

            {/* Title */}
            <div>
                <h2 className="text-2xl font-bold text-gray-100">Paste Created!</h2>
                {paste.title && (
                    <p className="text-gray-400 mt-1">{paste.title}</p>
                )}
            </div>

            {/* URL Display */}
            <div className="bg-dark-200 rounded-lg p-4 border border-gray-700">
                <p className="text-xs text-gray-500 mb-2">Share this link:</p>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={paste.url}
                        readOnly
                        className="input-field text-center text-primary-400 font-mono text-sm"
                    />
                    <button
                        onClick={handleCopy}
                        className={`btn-secondary shrink-0 ${copied ? 'bg-green-500/20 border-green-500 text-green-400' : ''}`}
                    >
                        {copied ? '✓ Copied!' : 'Copy'}
                    </button>
                </div>
            </div>

            {/* Expiration Info */}
            <div className="text-sm text-gray-500 space-y-1">
                <p>{formatExpiration()}</p>
                {paste.maxViews && (
                    <p>Max views: {paste.maxViews}</p>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
                <a
                    href={paste.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                >
                    View Paste →
                </a>
                <button onClick={onCreateAnother} className="btn-primary">
                    Create Another
                </button>
            </div>
        </div>
    );
}

export default ShareLink;
