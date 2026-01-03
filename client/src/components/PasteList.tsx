
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DeleteModal from './DeleteModal';
import { getAllPastes, deletePaste, deleteAllPastes } from '../services/api';
import type { PasteListItem } from '../services/api';

// Sub-component for individual paste items with live timer
function PasteListItem({
    paste,
    deletingId,
    onOpenDeleteModal,
    onExpire
}: {
    paste: PasteListItem,
    deletingId: string | null,
    onOpenDeleteModal: (id: string, title: string | null) => void,
    onExpire: (id: string) => void
}) {
    const [timeRemaining, setTimeRemaining] = useState<string>('');

    useEffect(() => {
        const updateTime = () => {
            if (!paste.expiresAt) {
                setTimeRemaining('Never');
                return;
            }

            const now = new Date();
            const expires = new Date(paste.expiresAt);
            const diff = expires.getTime() - now.getTime();

            if (diff <= 0) {
                onExpire(paste.id);
                // Also visually set to Expired in case removal lags
                setTimeRemaining('Expired');
                return;
            }

            const seconds = Math.floor((diff / 1000) % 60);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));

            if (days > 0) {
                setTimeRemaining(`${days}d ${hours}h`);
            } else if (hours > 0) {
                setTimeRemaining(`${hours}h ${minutes}m`);
            } else if (minutes > 0) {
                setTimeRemaining(`${minutes}m ${seconds}s`);
            } else {
                setTimeRemaining(`${seconds}s`);
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [paste.expiresAt, paste.id, onExpire]);

    return (
        <div className="paste-list-item">
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {paste.title || 'Untitled'}
                </p>
                <p style={{ margin: '0.125rem 0 0', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                    Expires in {timeRemaining} • {paste.viewCount} views
                </p>
            </div>
            <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                <button
                    onClick={() => onOpenDeleteModal(paste.id, paste.title)}
                    className="btn btn-danger-ghost btn-icon btn-sm"
                    disabled={deletingId === paste.id}
                    title="Delete paste"
                    style={{ padding: '0.375rem' }}
                >
                    {deletingId === paste.id ? (
                        <div className="spin" style={{ width: '14px', height: '14px', border: '2px solid #ef4444', borderTopColor: 'transparent', borderRadius: '50%' }} />
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                    )}
                </button>
                <Link
                    to={`/${paste.id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.375rem 0.75rem' }}
                >
                    View
                </Link>
            </div>
        </div>
    );
}

function PasteList() {
    const location = useLocation();
    const [pastes, setPastes] = useState<PasteListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deletingAll, setDeletingAll] = useState(false);

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type: 'single' | 'all';
        id?: string;
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'single',
        title: '',
        message: '',
    });

    const fetchPastes = async () => {
        try {
            setLoading(true);
            const data = await getAllPastes();
            setPastes(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch pastes:', err);
            setError('Failed to load pastes');
        } finally {
            setLoading(false);
        }
    };

    // Refetch when navigating back to this page (location.key changes on navigation)
    useEffect(() => {
        fetchPastes();
    }, [location.key]);

    const handleExpire = (id: string) => {
        setPastes(prev => prev.filter(p => p.id !== id));
    };

    const openDeleteModal = (id: string, title: string | null) => {
        setModalConfig({
            isOpen: true,
            type: 'single',
            id,
            title: 'Delete Paste',
            message: `Are you sure you want to delete "${title || 'Untitled'}"? This action cannot be undone.`,
        });
    };

    const openDeleteAllModal = () => {
        setModalConfig({
            isOpen: true,
            type: 'all',
            title: 'Delete All Pastes',
            message: 'Are you sure you want to delete ALL pastes? This action cannot be undone.',
        });
    };

    const confirmDelete = async () => {
        if (modalConfig.type === 'single' && modalConfig.id) {
            setDeletingId(modalConfig.id);
            setModalConfig(prev => ({ ...prev, isOpen: false })); // Close immediately or wait? better close and show spinner on item

            try {
                await deletePaste(modalConfig.id);
                setPastes(prev => prev.filter(p => p.id !== modalConfig.id));
            } catch (err) {
                console.error('Failed to delete paste:', err);
                alert('Failed to delete paste');
            } finally {
                setDeletingId(null);
            }
        } else if (modalConfig.type === 'all') {
            setDeletingAll(true);
            setModalConfig(prev => ({ ...prev, isOpen: false }));

            try {
                await deleteAllPastes();
                setPastes([]);
            } catch (err) {
                console.error('Failed to delete all pastes:', err);
                alert('Failed to delete pastes');
            } finally {
                setDeletingAll(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="card">
                <div className="card-header" style={{ paddingBottom: 0 }}>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Your Pastes
                    </h2>
                </div>
                <div style={{ padding: '0 1.25rem' }}>
                    <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '1rem 0' }} />
                </div>
                <div className="paste-list-empty">
                    <div className="spin" style={{ width: '24px', height: '24px', margin: '0 auto 1rem', border: '2px solid var(--border-color)', borderTopColor: 'var(--accent-500)', borderRadius: '50%' }} />
                    Loading...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card">
                <div className="card-header" style={{ paddingBottom: 0 }}>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Your Pastes
                    </h2>
                </div>
                <div style={{ padding: '0 1.25rem' }}>
                    <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '1rem 0' }} />
                </div>
                <div className="paste-list-empty">
                    <p style={{ color: '#ef4444' }}>{error}</p>
                    <button onClick={fetchPastes} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <DeleteModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDelete}
                title={modalConfig.title}
                message={modalConfig.message}
                isDeleting={false} // Loading handled in list items
            />

            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingBottom: 0 }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Your Pastes
                    {pastes.length > 0 && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-tertiary)' }}>
                            ({pastes.length})
                        </span>
                    )}
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {pastes.length > 0 && (
                        <button
                            onClick={openDeleteAllModal}
                            className="btn btn-danger-ghost btn-sm"
                            disabled={deletingAll}
                            title="Delete all pastes"
                        >
                            {deletingAll ? 'Deleting...' : 'Clear All'}
                        </button>
                    )}
                    <button onClick={fetchPastes} className="btn btn-ghost btn-icon" title="Refresh">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 2v6h-6" />
                            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                            <path d="M3 22v-6h6" />
                            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                        </svg>
                    </button>
                </div>
            </div>
            <div style={{ padding: '0 1.25rem' }}>
                <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '1rem 0' }} />
            </div>

            {pastes.length === 0 ? (
                <div className="paste-list-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 1rem', opacity: 0.3 }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>No pastes yet</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Create your first paste to get started</p>
                </div>
            ) : (
                <div>
                    {pastes.map((paste) => (
                        <PasteListItem
                            key={paste.id}
                            paste={paste}
                            deletingId={deletingId}
                            onOpenDeleteModal={openDeleteModal}
                            onExpire={handleExpire}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default PasteList;
