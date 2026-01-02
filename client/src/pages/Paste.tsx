import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import ViewPaste from '../components/ViewPaste';
import { getPaste, PasteResponse } from '../services/api';

function Paste() {
    const { id } = useParams();
    const [paste, setPaste] = useState<PasteResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPaste = async () => {
            if (!id) return;

            try {
                const data = await getPaste(id);
                setPaste(data);
            } catch (err: unknown) {
                if (err && typeof err === 'object' && 'response' in err) {
                    const axiosErr = err as { response?: { status?: number } };
                    if (axiosErr.response?.status === 404) {
                        setError('Paste not found or has expired');
                    } else {
                        setError('Failed to load paste');
                    }
                } else {
                    setError('Failed to load paste');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPaste();
    }, [id]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 p-4">
                <div className="max-w-4xl mx-auto animate-fade-in">
                    {loading ? (
                        <div className="card p-8 text-center">
                            <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
                            <p className="text-gray-400 mt-4">Loading paste...</p>
                        </div>
                    ) : error ? (
                        <div className="card p-8 text-center">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                                <span className="text-3xl">😢</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-100 mt-4">{error}</h2>
                            <p className="text-gray-500 mt-2">
                                This paste may have expired or been deleted.
                            </p>
                            <Link to="/" className="btn-primary inline-block mt-6">
                                Create New Paste
                            </Link>
                        </div>
                    ) : paste ? (
                        <div className="card p-6 md:p-8">
                            <ViewPaste paste={paste} />
                        </div>
                    ) : null}
                </div>
            </main>
        </div>
    );
}

export default Paste;
