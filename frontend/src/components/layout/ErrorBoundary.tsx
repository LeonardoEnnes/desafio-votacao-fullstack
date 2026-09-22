import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    temErro: boolean;
    mensagem?: string;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { temErro: false };

    static getDerivedStateFromError(error: Error): State {
        return { temErro: true, mensagem: error.message };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary]', error, info);
    }

    render() {
        if (this.state.temErro) {
            return (
                this.props.fallback ?? (
                    <div className="max-w-lg mx-auto py-20 text-center space-y-4">
                        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
                        <h2 className="text-xl font-bold text-slate-800">Algo deu errado</h2>
                        <p className="text-sm text-slate-500">{this.state.mensagem}</p>
                        <Button onClick={() => window.location.reload()}>Recarregar página</Button>
                    </div>
                )
            );
        }
        return this.props.children;
    }
}