import { useState } from 'react';
import { createPaste } from '../services/api';
import type { CreatePasteResponse } from '../services/api';

interface CreatePasteProps {
    onSuccess: (response: CreatePasteResponse) => void;
}

const EXPIRATION_OPTIONS = [
    { label: '1 minute', value: 60 },
    { label: '2 minutes', value: 120 },
    { label: '5 minutes', value: 300 },
    { label: '10 minutes', value: 600 },
    { label: '15 minutes', value: 900 },
    { label: '30 minutes', value: 1800 },
    { label: '1 hour', value: 3600 },
    { label: '6 hours', value: 21600 },
    { label: '12 hours', value: 43200 },
    { label: '1 day', value: 86400 },
    { label: '1 week', value: 604800 },
    { label: '1 month', value: 2592000 },
];

function CreatePaste({ onSuccess }: CreatePasteProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [expiresIn, setExpiresIn] = useState<number | ''>('');
    const [maxViews, setMaxViews] = useState<number | ''>('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ title?: string; content?: string; expiresIn?: string; maxViews?: string }>({});

    const validate = () => {
        const newErrors: { title?: string; content?: string; expiresIn?: string; maxViews?: string } = {};

        if (!title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!content.trim()) {
            newErrors.content = 'Content is required';
        }

        if (!expiresIn) {
            newErrors.expiresIn = 'Expiration is required';
        }

        if (maxViews !== '' && (Number(maxViews) < 1)) {
            newErrors.maxViews = 'Max views must be at least 1';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsLoading(true);

        try {
            const response = await createPaste({
                title: title.trim(),
                content: content.trim(),
                expiresIn: expiresIn as number,
                maxViews: maxViews !== '' ? Number(maxViews) : undefined,
            });
            onSuccess(response);
            setTitle('');
            setContent('');
            setExpiresIn('');
            setMaxViews('');
            setErrors({});
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as { response?: { data?: { error?: string } } };
                setErrors({ content: axiosErr.response?.data?.error || 'Failed to create paste' });
            } else {
                setErrors({ content: 'Failed to create paste' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-header" style={{ textAlign: 'center', paddingBottom: 0 }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Create New Paste
                </h2>
            </div>
            <div style={{ padding: '0 1.25rem' }}>
                <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '1rem 0' }} />
            </div>
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    {/* Title */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="title" className="label label-required">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter a title for your paste"
                            className="input-field"
                            maxLength={255}
                        />
                        {errors.title && <p className="error-text">{errors.title}</p>}
                    </div>

                    {/* Content */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="content" className="label label-required">
                            Content
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Paste your text here..."
                            className="input-field"
                            style={{ minHeight: '200px' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                            {errors.content ? (
                                <p className="error-text" style={{ margin: 0 }}>{errors.content}</p>
                            ) : (
                                <span />
                            )}
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                {content.length.toLocaleString()} characters
                            </span>
                        </div>
                    </div>

                    {/* Expiration */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="expiresIn" className="label label-required">
                            Expires After
                        </label>
                        <select
                            id="expiresIn"
                            value={expiresIn}
                            onChange={(e) => setExpiresIn(e.target.value ? parseInt(e.target.value, 10) : '')}
                            className="input-field"
                        >
                            <option value="">Select expiration...</option>
                            {EXPIRATION_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {errors.expiresIn && <p className="error-text">{errors.expiresIn}</p>}
                    </div>

                    {/* Max Views (Optional) */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="maxViews" className="label">
                            Max Views (Optional)
                        </label>
                        <input
                            type="number"
                            id="maxViews"
                            value={maxViews}
                            onChange={(e) => setMaxViews(e.target.value ? parseInt(e.target.value, 10) : '')}
                            placeholder="e.g. 100 (Leave empty for unlimited)"
                            className="input-field"
                            min="1"
                            onWheel={(e) => (e.target as HTMLElement).blur()}
                        />
                        {errors.maxViews && <p className="error-text">{errors.maxViews}</p>}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                    >
                        {isLoading ? (
                            <>
                                <span className="spin" style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                                Creating...
                            </>
                        ) : (
                            'Create Paste'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreatePaste;
