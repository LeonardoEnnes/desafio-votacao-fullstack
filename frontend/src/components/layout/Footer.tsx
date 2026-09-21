export function Footer() {
    return (
        <footer className="bg-emerald-800 text-emerald-100 py-6 mt-12 text-center text-sm shadow-inner">
            <div className="max-w-6xl mx-auto px-4">
                <p>© {new Date().getFullYear()} Sistema de Votação Cooperativa. Todos os direitos reservados.</p>
            </div>
        </footer>
    );
}