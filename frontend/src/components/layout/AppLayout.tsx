import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function AppLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            <Header />
            <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}