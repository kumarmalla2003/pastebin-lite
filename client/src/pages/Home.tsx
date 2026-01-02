import { useState, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CreatePaste from '../components/CreatePaste';
import ShareLink from '../components/ShareLink';
import PasteList from '../components/PasteList';
import type { CreatePasteResponse } from '../services/api';

function Home() {
    const [createdPaste, setCreatedPaste] = useState<CreatePasteResponse | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSuccess = useCallback((response: CreatePasteResponse) => {
        setCreatedPaste(response);
        setRefreshKey(prev => prev + 1);
    }, []);

    const handleCreateAnother = useCallback(() => {
        setCreatedPaste(null);
    }, []);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
            <Header />

            <main className="container" style={{ flex: 1, paddingTop: '1.5rem', paddingBottom: '2rem' }}>
                <div className="two-col">
                    {/* Left Column: Create / Success */}
                    <div>
                        {createdPaste ? (
                            <ShareLink paste={createdPaste} onCreateAnother={handleCreateAnother} />
                        ) : (
                            <CreatePaste onSuccess={handleSuccess} />
                        )}
                    </div>

                    {/* Right Column: Paste List */}
                    <div>
                        <PasteList key={refreshKey} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Home;
