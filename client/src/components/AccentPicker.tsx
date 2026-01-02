import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const ACCENT_COLORS = [
    { name: 'blue', color: '#3b82f6', label: 'Blue' },
    { name: 'green', color: '#22c55e', label: 'Green' },
    { name: 'purple', color: '#a855f7', label: 'Purple' },
    { name: 'orange', color: '#f97316', label: 'Orange' },
    { name: 'pink', color: '#ec4899', label: 'Pink' },
] as const;

function AccentPicker() {
    const { accent, setAccent } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentColor = ACCENT_COLORS.find(c => c.name === accent) || ACCENT_COLORS[0];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-ghost btn-icon"
                aria-label="Change accent color"
                title="Change accent color"
            >
                <div
                    style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: currentColor.color,
                        border: '2px solid var(--border-color)',
                    }}
                />
            </button>

            {isOpen && (
                <div
                    className="card fade-in"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        zIndex: 50,
                        minWidth: '140px',
                    }}
                >
                    {ACCENT_COLORS.map((color) => (
                        <button
                            key={color.name}
                            onClick={() => {
                                setAccent(color.name);
                                setIsOpen(false);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                width: '100%',
                                padding: '0.5rem 0.75rem',
                                border: 'none',
                                background: accent === color.name ? 'var(--bg-tertiary)' : 'transparent',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                color: 'var(--text-primary)',
                                fontSize: '0.875rem',
                            }}
                        >
                            <div
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    backgroundColor: color.color,
                                }}
                            />
                            {color.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AccentPicker;
