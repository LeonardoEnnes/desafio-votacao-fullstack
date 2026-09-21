import { Vote } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
    return (
        <header className="bg-emerald-700 text-white shadow-md">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <Vote className="w-8 h-8" />
                    <h1 className="text-xl font-bold tracking-tight">Assembleia Cooperativa</h1>
                </Link>
            </div>
        </header>
    );
}