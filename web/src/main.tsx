import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './providers/AuthProvider.tsx';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            {/* The frame of the whole app, so that everything rendered, even before App (the session loading or
            failing), fills the screen */}
            <div className="flex flex-col min-h-screen bg-gray-100">
                <AuthProvider>
                    <App />
                </AuthProvider>
            </div>
        </BrowserRouter>
    </StrictMode>,
);
