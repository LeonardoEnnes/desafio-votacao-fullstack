import { useState } from 'react';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AreaAssociado } from '@/components/associado/AreaAssociado';
import { SessoesAbertasBanner } from '@/components/sessao/SessoesAbertasBanner';
import { PautaVotacaoCard } from '@/components/voto/VotacaoCard';
import { NovaPautaModal } from '@/components/pauta/NovaPautaModal';
import { usePautasComSessoes } from '@/hooks/usePautasComSessoes';

export function HomePage() {
    const { pautas, sessoesAbertasIds, loading, erro, recarregar } = usePautasComSessoes();
    const [modalAberto, setModalAberto] = useState(false);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <AreaAssociado />

            <SessoesAbertasBanner pautasCadastradas={pautas} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        Pautas de Votação
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Selecione uma pauta para gerenciar a sessão ou vote diretamente nos cards ativos.
                    </p>
                </div>
                <Button
                    onClick={() => setModalAberto(true)}
                    className="bg-slate-900 hover:bg-slate-800 text-white"
                >
                    <PlusCircle className="w-4 h-4 mr-2" /> Nova Pauta
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                </div>
            ) : erro ? (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-8 text-center">
                    <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
                    <p className="text-rose-700 font-medium mb-3">{erro}</p>
                    <Button onClick={recarregar} variant="outline">Tentar novamente</Button>
                </div>
            ) : pautas.length === 0 ? (
                <div className="bg-white rounded-lg border border-slate-200 p-16 text-center shadow-sm">
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-1">
                        Nenhuma pauta cadastrada
                    </h3>
                    <p className="text-slate-500">
                        Crie a primeira pauta para iniciar as deliberações.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pautas.map((pauta) => (
                        <PautaVotacaoCard
                            key={pauta.id}
                            pauta={pauta}
                            sessaoAberta={sessoesAbertasIds.includes(pauta.id)}
                            onVotoRealizado={recarregar}
                        />
                    ))}
                </div>
            )}

            {modalAberto && (
                <NovaPautaModal
                    onClose={() => setModalAberto(false)}
                    onSuccess={recarregar}
                />
            )}
        </div>
    );
}