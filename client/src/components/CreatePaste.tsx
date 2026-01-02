import { useState } from 'react';
import { createPaste } from '../services/api';
import type { CreatePasteResponse } from '../services/api';

interface CreatePasteProps {
    onSuccess: (response: CreatePasteResponse) => void;
}

const EXPIRATION_OPTIONS = [
    { label: 'Never', value: 0 },
    { label: '10 Minutes', value: 600 },
    { label: '1 Hour', value: 3600 },
    { label: '1 Day', value: 86400 },
    { label: '1 Week', value: 604800 },
    { label: '1 Month', value: 2592000 },
];

function CreatePaste({ onSuccess }: CreatePasteProps) {
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [expiresIn, setExpiresIn] = useState(0);
    const [maxViews, setMaxViews] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!content.trim()) {
            setError('Content is required');
            return;
        }

        setIsLoading(true);

        try {
            const response = await createPaste({
                content: content.trim(),
                title: title.trim() || undefined,
                expiresIn: expiresIn || undefined,
                maxViews: maxViews ? parseInt(maxViews, 10) : undefined,
            });
            onSuccess(response);
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as { response?: { data?: { error?: string } } };
                setError(axiosErr.response?.data?.error || 'Failed to create paste');
            } else {
                setError('Failed to create paste');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title Input */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2">
                    Title (optional)
                </label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My awesome paste..."
                    className="input-field"
                    maxLength={255}
                />
            </div>

            {/* Content Textarea */}
            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-400 mb-2">
                    Content <span className="text-red-400">*</span>
                </label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your text here..."
                    className="input-field font-mono text-sm min-h-[300px] resize-y"
                    required
                />
                <p className="text-xs text-gray-500 mt-1">
                    {content.length.toLocaleString()} characters
                </p>
            </div>

            {/* Options Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Expiration */}
                <div>
                    <label htmlFor="expiresIn" className="block text-sm font-medium text-gray-400 mb-2">
                        Expires After
                    </label>
                    <select
                        id="expiresIn"
                        value={expiresIn}
                        onChange={(e) => setExpiresIn(parseInt(e.target.value, 10))}
                        className="input-field"
                    >
                        {EXPIRATION_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Max Views */}
                <div>
                    <label htmlFor="maxViews" className="block text-sm font-medium text-gray-400 mb-2">
                        Max Views (optional)
                    </label>
                    <input
                        type="number"
                        id="maxViews"
                        value={maxViews}
                        onChange={(e) => setMaxViews(e.target.value)}
                        placeholder="Unlimited"
                        className="input-field"
                        min="1"
                        max="1000000"
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading || !content.trim()}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating...
                    </>
                ) : (
                    <>
                        <span>🚀</span>
                        Create Paste
                    </>
                )}
            </button>
        </form>
    );
}

export default CreatePaste;
