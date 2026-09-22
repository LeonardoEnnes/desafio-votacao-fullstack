import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { NovaPautaModal } from '@/components/layout/NovaPautaModal';
import { PautaCard } from '@/components/layout/PautaCard';
import { SessoesAbertasBanner } from '@/components/layout/SessoesAbertasBanner';
import { useSessoesAbertas } from '@/hooks/useSessoesAbertas'; // Se tiver criado o hook, ou use o array direto
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, AlertCircle, UserCheck, IdCard } from 'lucide-react';
import type { Pauta } from '@/types/pauta'; // Importação correta do tipo global

export function HomePage() {
    const [pautas, setPautas] = useState<Pauta[]>([]);
    const [sessoesAbertasIds, setSessoesAbertasIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalAberto, setModalAberto] = useState(false);

    const [cpfInput, setCpfInput] = useState('');
    const [associadoCpf, setAssociadoCpf] = useState(localStorage.getItem('@votacao:cpf') || '');
    const [erroCpf, setErroCpf] = useState('');

    const mascararCpf = (cpf: string) => {
        if (!cpf || cpf.length !== 11) return '***.***.***-**';
        return `***.***.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
    };

    useEffect(() => {
        carregarDados();
    }, []);

    async function carregarDados() {
        try {
            setLoading(true);
            const [resPautas, resSessoes] = await Promise.all([
                api.get('/pautas'),
                api.get('/sessoes/abertas').catch(() => ({ data: [] }))
            ]);
            setPautas(resPautas.data);
            setSessoesAbertasIds(resSessoes.data.map((s: any) => s.pautaId));
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleIdentificar(e: React.FormEvent) {
        e.preventDefault();
        setErroCpf('');
        if (!cpfInput.trim()) return setErroCpf('Digite um CPF válido.');

        try {
            await api.post('/associados', { cpf: cpfInput.trim() });
            salvarCpf(cpfInput.trim());
        } catch (error: any) {
            if (error.response?.status === 409) {
                salvarCpf(cpfInput.trim());
            } else {
                setErroCpf('Erro ao validar CPF. Verifique os dados.');
            }
        }
    }

    function salvarCpf(cpf: string) {
        setAssociadoCpf(cpf);
        localStorage.setItem('@votacao:cpf', cpf);
        setCpfInput('');
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Card className="border-emerald-100 shadow-sm bg-emerald-50/50">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full">
                            <IdCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800 text-lg">Área do Associado</h3>
                            <p className="text-sm text-slate-600">
                                Identifique-se para habilitar seu direito a voto nas sessões abertas.
                            </p>
                        </div>
                    </div>

                    <div className="w-full sm:w-auto">
                        {associadoCpf ? (
                            <div className="flex items-center justify-between sm:justify-start gap-4 bg-white px-4 py-2 border border-emerald-200 rounded-lg shadow-sm">
                                <div className="flex items-center gap-2">
                                    <UserCheck className="w-5 h-5 text-emerald-600" />
                                    CPF logado: {mascararCpf(associadoCpf)}
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-slate-400 hover:text-rose-600 h-8"
                                    onClick={() => {
                                        setAssociadoCpf('');
                                        localStorage.removeItem('@votacao:cpf');
                                    }}
                                >
                                    Sair
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleIdentificar} className="flex flex-col sm:flex-row gap-2">
                                <div className="flex flex-col gap-1 w-full sm:w-64">
                                    <Input 
                                        placeholder="Digite seu CPF (apenas números)" 
                                        value={cpfInput}
                                        onChange={(e) => setCpfInput(e.target.value)}
                                        className="bg-white border-slate-300 focus-visible:ring-emerald-600"
                                    />
                                    {erroCpf && <span className="text-xs text-rose-600 font-medium ml-1">{erroCpf}</span>}
                                </div>
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
                                    Entrar
                                </Button>
                            </form>
                        )}
                    </div>
                </CardContent>
            </Card>

            <SessoesAbertasBanner pautasCadastradas={pautas} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Pautas de Votação</h2>
                    <p className="text-sm text-slate-500 mt-1">Selecione uma pauta para visualizar os detalhes ou votar.</p>
                </div>
                <Button onClick={() => setModalAberto(true)} className="bg-slate-900 hover:bg-slate-800 text-white">
                    <PlusCircle className="w-4 h-4 mr-2" /> Nova Pauta
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
            ) : pautas.length === 0 ? (
                <div className="bg-white rounded-lg border border-slate-200 p-16 text-center shadow-sm">
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-1">Nenhuma pauta cadastrada</h3>
                    <p className="text-slate-500">Crie a primeira pauta para iniciar as deliberações.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pautas.map((pauta) => (
                        <PautaCard 
                            key={pauta.id} 
                            pauta={pauta} 
                            sessaoAberta={sessoesAbertasIds.includes(pauta.id)} 
                        />
                    ))}
                </div>
            )}

            {modalAberto && (
                <NovaPautaModal 
                    onClose={() => setModalAberto(false)} 
                    onSuccess={carregarDados} 
                />
            )}
        </div>
    );
}