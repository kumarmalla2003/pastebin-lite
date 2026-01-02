import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PasteResponse } from '../services/api';

interface ViewPasteProps {
    paste: PasteResponse;
}

function ViewPaste({ paste }: ViewPasteProps) {
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-100">
                        {paste.title || 'Untitled Paste'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Created: {formatDate(paste.createdAt)}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleCopy}
                        className={`btn-secondary text-sm ${copied ? 'bg-green-500/20 border-green-500 text-green-400' : ''}`}
                    >
                        {copied ? '✓ Copied!' : 'Copy'}
                    </button>
                    <Link to="/" className="btn-primary text-sm">
                        + New
                    </Link>
                </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-sm">
                {paste.expiresAt && (
                    <span className="bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full">
                        Expires: {formatDate(paste.expiresAt)}
                    </span>
                )}
                {paste.maxViews && (
                    <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full">
                        Views: {paste.viewCount} / {paste.maxViews}
                    </span>
                )}
                {!paste.expiresAt && !paste.maxViews && (
                    <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full">
                        Never expires
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="bg-dark-200 rounded-lg border border-gray-700 overflow-hidden">
                <div className="bg-dark-100 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-mono">
                        {paste.content.split('\n').length} lines • {paste.content.length.toLocaleString()} characters
                    </span>
                </div>
                <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap break-words">
                    {paste.content}
                </pre>
            </div>
        </div>
    );
}

export default ViewPaste;
