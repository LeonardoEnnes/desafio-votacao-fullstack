import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { NovaPautaModal } from '@/components/layout/NovaPautaModal';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PlusCircle, AlertCircle, UserCheck, IdCard } from 'lucide-react';

interface Pauta {
    id: string;
    descricao: string;
}

export function HomePage() {
    const navigate = useNavigate();
    const [pautas, setPautas] = useState<Pauta[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalAberto, setModalAberto] = useState(false);

    const [cpfInput, setCpfInput] = useState('');
    const [associadoCpf, setAssociadoCpf] = useState(localStorage.getItem('@votacao:cpf') || '');
    const [erroCpf, setErroCpf] = useState('');

    useEffect(() => {
        carregarPautas();
    }, []);

    async function carregarPautas() {
        try {
            setLoading(true);
            const response = await api.get('/pautas');
            setPautas(response.data);
        } catch (error) {
            console.error('Erro ao buscar pautas:', error);
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
                                    <span className="text-sm font-medium text-slate-700">CPF: {associadoCpf}</span>
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
                        <Card key={pauta.id} className="hover:shadow-md transition-all duration-200 border-slate-200 flex flex-col justify-between group">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">
                                        Pauta
                                    </Badge>
                                    <span className="text-xs text-slate-400 font-mono">
                                        #{pauta.id.split('-')[0]}
                                    </span>
                                </div>
                                <CardTitle className="text-lg font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                                    {pauta.descricao}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500">Acesse para abrir sessão, registrar seu voto ou conferir a apuração.</p>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <Button 
                                    onClick={() => navigate(`/pauta/${pauta.id}`)}
                                    variant="outline"
                                    className="w-full border-slate-300 hover:bg-slate-50 hover:text-emerald-700"
                                >
                                    Acessar Painel
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {modalAberto && (
                <NovaPautaModal 
                    onClose={() => setModalAberto(false)} 
                    onSuccess={carregarPautas} 
                />
            )}
        </div>
    );
}