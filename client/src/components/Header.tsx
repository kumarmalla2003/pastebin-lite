import { Link } from 'react-router-dom';

function Header() {
    return (
        <header className="bg-dark-200 border-b border-gray-800">
            <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg font-bold">P</span>
                    </div>
                    <span className="text-xl font-semibold text-gray-100 group-hover:text-primary-400 transition-colors">
                        Pastebin Lite
                    </span>
                </Link>
                <Link to="/" className="btn-primary text-sm">
                    + New Paste
                </Link>
            </div>
        </header>
    );
}

export default Header;
