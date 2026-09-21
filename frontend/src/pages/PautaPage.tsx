import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, PlayCircle, CheckCircle2, XCircle, BarChart3, AlertCircle, Clock } from 'lucide-react';

interface Pauta {
    id: string;
    titulo: string;
    descricao?: string;
    dataCriacao?: string;
    sessao?: {
        id: string;
        dataEncerramento: string;
        aberta: boolean;
    };
}

interface ResultadoDto {
    id: string;
    titulo: string;
    totalVotos: number;
    totalVotosSim: number;
    totalVotosNao: number;
}

export function PautaPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [pauta, setPauta] = useState<Pauta | null>(null);
    const [resultado, setResultado] = useState<ResultadoDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [minutosSessao, setMinutosSessao] = useState('1');
    const [cpfVoto, setCpfVoto] = useState('');
    const [sessaoEstaAberta, setSessaoEstaAberta] = useState(false);
    const [mensagemFeedback, setMensagemFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

    useEffect(() => {
        if (id) {
            carregarDetalhesPauta();
        }
    }, [id]);

    async function carregarDetalhesPauta() {
        try {
            setLoading(true);
            const resPauta = await api.get(`/pautas/${id}`);
            setPauta(resPauta.data);

            try {
                const resSessoes = await api.get('/sessoes/abertas');
                const estaAberta = resSessoes.data.some((s: any) => s.pautaId === id || s.id === pauta?.sessao?.id);
                setSessaoEstaAberta(estaAberta || Boolean(resPauta.data.sessao?.aberta));
            } catch {
                setSessaoEstaAberta(Boolean(resPauta.data.sessao?.aberta));
            }

            try {
                const resResultado = await api.get(`/pautas/${id}/resultado`);
                setResultado(resResultado.data);
            } catch {
                setResultado(null);
            }
        } catch (error) {
            console.error('Erro ao carregar detalhes da pauta:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleAbrirSessao() {
        try {
            const minutos = parseInt(minutosSessao) || 1;
            await api.post(`/pautas/${id}/sessoes`, { tempoMinutos: minutos });
            setMensagemFeedback({ tipo: 'sucesso', texto: 'Sessão de votação aberta com sucesso!' });
            await carregarDetalhesPauta(); 
        } catch (error: any) {
            if (error.response?.status === 409) {
                setSessaoEstaAberta(true);
                setMensagemFeedback({ tipo: 'erro', texto: 'Já existe uma sessão aberta para esta pauta.' });
            } else {
                setMensagemFeedback({ tipo: 'erro', texto: 'Erro ao abrir a sessão.' });
            }
        }
    }

    async function handleVotar(opcao: 'SIM' | 'NAO') {
        if (!cpfVoto.trim()) {
            setMensagemFeedback({ tipo: 'erro', texto: 'Por favor, informe seu CPF para registrar o voto.' });
            return;
        }

        try {
            setMensagemFeedback(null);
            await api.post(`/pautas/${id}/votos`, {
                associadoCpf: cpfVoto.trim(),
                valor: opcao,
            });
            
            setMensagemFeedback({ tipo: 'sucesso', texto: `Voto "${opcao}" registrado com sucesso!` });
            setCpfVoto('');
            carregarDetalhesPauta();
        } catch (error: any) {
            if (error.response?.status === 409) {
                setMensagemFeedback({ tipo: 'erro', texto: 'Conflito: Você já votou ou CPF inapto a votar.' });
            } else if (error.response?.status === 404) {
                setMensagemFeedback({ tipo: 'erro', texto: 'CPF não encontrado ou inválido no sistema.' });
            } else {
                setMensagemFeedback({ tipo: 'erro', texto: 'Erro ao registrar voto. Verifique se a sessão está ativa.' });
            }
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!pauta) {
        return (
            <div className="text-center py-20 space-y-4">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-lg font-bold text-slate-700">Pauta não encontrada</h3>
                <Button onClick={() => navigate('/')} variant="outline">Voltar para o Início</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
            <Button 
                onClick={() => navigate('/')} 
                variant="ghost" 
                className="text-slate-600 hover:text-slate-900 p-0 hover:bg-transparent flex items-center gap-2"
            >
                <ArrowLeft className="w-4 h-4" /> Voltar para a listagem
            </Button>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <div className="flex justify-between items-center mb-2">
                        <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 font-mono">
                            ID: {pauta.id}
                        </Badge>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900 leading-tight">
                        {pauta.titulo}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {pauta.descricao && (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <span className="text-xs font-semibold text-slate-400 block mb-1">Descrição detalhada:</span>
                            <p className="text-slate-700 text-base leading-relaxed">{pauta.descricao}</p>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-emerald-600" />
                            <div>
                                <span className="text-xs text-slate-500 block">Status da Sessão:</span>
                                <strong className="text-sm text-slate-800">
                                    {sessaoEstaAberta ? 'Aberta para recebimento de votos' : 'Sessão Encerrada ou Não Iniciada'}
                                </strong>
                            </div>
                        </div>

                        {pauta.sessao?.dataEncerramento && (
                            <div className="text-xs text-slate-600">
                                Encerramento: <strong>{new Date(pauta.sessao.dataEncerramento).toLocaleString('pt-BR')}</strong>
                            </div>
                        )}
                    </div>

                    {mensagemFeedback && (
                        <div className={`p-3 rounded-md text-sm font-medium ${
                            mensagemFeedback.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-250'
                        }`}>
                            {mensagemFeedback.texto}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex justify-between items-center">
                    {!sessaoEstaAberta ? (
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 font-medium">Tempo (min):</span>
                                <Input 
                                    type="number" 
                                    value={minutosSessao}
                                    onChange={(e) => setMinutosSessao(e.target.value)}
                                    className="w-20 h-9 bg-white"
                                    min="1"
                                />
                            </div>
                            <Button onClick={handleAbrirSessao} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                                <PlayCircle className="w-4 h-4" /> Abrir Sessão
                            </Button>
                        </div>
                    ) : (
                        <span className="text-xs font-medium text-emerald-700 font-semibold">
                            Sessão ativa e pronta para receber votos.
                        </span>
                    )}
                </CardFooter>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-200 shadow-sm flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800">Terminal de Votação</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <p className="text-sm text-slate-500">
                            {sessaoEstaAberta 
                                ? 'Informe seu CPF e selecione sua escolha abaixo. O voto é irreversível.' 
                                : 'A votação está indisponível pois a sessão não está aberta.'}
                        </p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">CPF do Associado</label>
                                <Input 
                                    type="text"
                                    placeholder="Digite apenas os números do CPF"
                                    value={cpfVoto}
                                    onChange={(e) => setCpfVoto(e.target.value)}
                                    disabled={!sessaoEstaAberta}
                                    className="bg-white border-slate-300 focus-visible:ring-emerald-600"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button 
                                    onClick={() => handleVotar('SIM')}
                                    disabled={!sessaoEstaAberta || !cpfVoto.trim()}
                                    className="bg-emerald-600 hover:bg-emerald-505 text-white font-bold h-14 text-base gap-2 shadow-sm disabled:opacity-50"
                                >
                                    <CheckCircle2 className="w-5 h-5" /> SIM
                                </Button>
                                <Button 
                                    onClick={() => handleVotar('NAO')}
                                    disabled={!sessaoEstaAberta || !cpfVoto.trim()}
                                    className="bg-rose-600 hover:bg-rose-505 text-white font-bold h-14 text-base gap-2 shadow-sm disabled:opacity-50"
                                >
                                    <XCircle className="w-5 h-5" /> NÃO
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-emerald-600" /> Apuração de Resultados
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {resultado ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                                    <span className="text-slate-600">Total de Votos:</span>
                                    <strong className="text-slate-900">
                                        {resultado.totalVotos}
                                    </strong>
                                </div>
                                <div className="flex justify-between items-center text-sm p-2 bg-emerald-50 rounded text-emerald-800">
                                    <span>Votos SIM:</span>
                                    <strong>{resultado.totalVotosSim}</strong>
                                </div>
                                <div className="flex justify-between items-center text-sm p-2 bg-rose-50 rounded text-rose-800">
                                    <span>Votos NÃO:</span>
                                    <strong>{resultado.totalVotosNao}</strong>
                                </div>
                                <div className="pt-2 text-center">
                                    {resultado.totalVotos > 0 ? (
                                        <Badge className={resultado.totalVotosSim > resultado.totalVotosNao ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}>
                                            {resultado.totalVotosSim > resultado.totalVotosNao ? 'Aprovada' : 'Rejeitada'}
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-slate-300 text-slate-700">Aguardando Votos</Badge>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 text-center py-8 italic">
                                Os resultados consolidados aparecem aqui.
                            </p>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button 
                            onClick={carregarDetalhesPauta} 
                            variant="outline" 
                            className="w-full text-xs text-slate-600"
                        >
                            Atualizar Apuração
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}