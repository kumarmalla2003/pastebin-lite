import { useRef, useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isDeleting?: boolean;
}

function DeleteModal({ isOpen, onClose, onConfirm, title, message, isDeleting = false }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out',
        }}>
            <div
                ref={modalRef}
                className="card fade-in"
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '0',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }}
            >
                <div className="card-header" style={{ borderBottom: 'none', padding: '1.25rem 1.25rem 0' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {title}
                    </h3>
                </div>

                <div className="card-body" style={{ padding: '0.75rem 1.25rem 1.5rem', paddingTop: '0.5rem' }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {message}
                    </p>
                </div>

                <div style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '0.75rem',
                    borderBottomLeftRadius: '0.75rem',
                    borderBottomRightRadius: '0.75rem',
                }}>
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="btn btn-danger"
                        disabled={isDeleting}
                        style={{ minWidth: '80px' }}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteModal;
