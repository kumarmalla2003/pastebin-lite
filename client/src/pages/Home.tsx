import { useState } from 'react';
import Header from '../components/Header';
import CreatePaste from '../components/CreatePaste';
import ShareLink from '../components/ShareLink';
import type { CreatePasteResponse } from '../services/api';

function Home() {
    const [createdPaste, setCreatedPaste] = useState<CreatePasteResponse | null>(null);

    const handleSuccess = (response: CreatePasteResponse) => {
        setCreatedPaste(response);
    };

    const handleCreateAnother = () => {
        setCreatedPaste(null);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl animate-fade-in">
                    <div className="card p-6 md:p-8">
                        {createdPaste ? (
                            <ShareLink paste={createdPaste} onCreateAnother={handleCreateAnother} />
                        ) : (
                            <>
                                <div className="mb-6">
                                    <h1 className="text-2xl font-bold text-gray-100">Create New Paste</h1>
                                    <p className="text-gray-500 mt-1">Share text quickly with a shareable link</p>
                                </div>
                                <CreatePaste onSuccess={handleSuccess} />
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Home;
