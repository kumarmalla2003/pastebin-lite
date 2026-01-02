import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import AccentPicker from './AccentPicker';

function Header() {
    return (
        <header
            style={{
                backgroundColor: 'var(--bg-card)',
                borderBottom: '1px solid var(--border-color)',
                position: 'sticky',
                top: 0,
                zIndex: 40,
            }}
        >
            <div
                className="container"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: '64px',
                }}
            >
                {/* Logo */}
                <Link
                    to="/"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                    }}
                >
                    {/* New Clipboard Icon Logo */}
                    <div
                        style={{
                            width: '36px',
                            height: '36px',
                            backgroundColor: 'var(--accent-500)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                        </svg>
                    </div>
                    <div>
                        <span style={{ fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.025em' }}>
                            Pastebin
                        </span>
                        <span style={{ fontWeight: 400, fontSize: '1.125rem', color: 'var(--text-tertiary)', marginLeft: '4px' }}>
                            Lite
                        </span>
                    </div>
                </Link>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AccentPicker />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}

export default Header;
