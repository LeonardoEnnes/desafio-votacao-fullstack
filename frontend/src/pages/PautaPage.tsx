import { useParams, useNavigate } from 'react-router-dom';
import { usePautaDetalhe } from '@/hooks/usePautaDetalhes';
import { calcularPercentuais, formatarData } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, PlayCircle, CheckCircle2, XCircle, BarChart3, Clock } from 'lucide-react';

export function PautaPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {
        pauta, resultado, sessaoAberta, loading,
        minutosSessao, setMinutosSessao, cpfVoto, setCpfVoto,
        feedback, abrirSessao, votar, recarregar
    } = usePautaDetalhe(id);

    if (loading) return <div className="text-center py-20 animate-pulse text-emerald-600 font-semibold">Carregando...</div>;
    if (!pauta) return <div className="text-center py-20">Pauta não encontrada.</div>;

    const { total, sim, nao, pctSim, pctNao } = calcularPercentuais(resultado);

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
            <Button onClick={() => navigate('/')} variant="ghost" className="text-slate-600 gap-2 px-0 hover:bg-transparent">
                <ArrowLeft className="w-4 h-4" /> Voltar para a listagem
            </Button>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <Badge variant="outline" className="w-fit border-emerald-200 text-emerald-700 bg-emerald-50 font-mono mb-2">
                        ID: {pauta.id}
                    </Badge>
                    <CardTitle className="text-2xl font-bold text-slate-900 leading-tight">{pauta.titulo}</CardTitle>
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
                                    {sessaoAberta ? 'Aberta para recebimento de votos' : 'Sessão Encerrada ou Não Iniciada'}
                                </strong>
                            </div>
                        </div>

                        {pauta.sessao?.dataEncerramento && (
                            <div className="text-xs text-slate-600">
                                Encerramento: <strong>{formatarData(pauta.sessao.dataEncerramento)}</strong>
                            </div>
                        )}
                    </div>

                    {feedback && (
                        <div className={`p-3 rounded-md text-sm font-medium ${feedback.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-250'}`}>
                            {feedback.texto}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex justify-between items-center">
                    {!sessaoAberta ? (
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 font-medium">Tempo (min):</span>
                                <Input type="number" value={minutosSessao} onChange={e => setMinutosSessao(e.target.value)} className="w-20 h-9 bg-white" min="1" />
                            </div>
                            <Button onClick={abrirSessao} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
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
                            {sessaoAberta ? 'Informe seu CPF e selecione sua escolha abaixo. O voto é irreversível.' : 'A votação está indisponível pois a sessão não está aberta.'}
                        </p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">CPF do Associado</label>
                                <Input 
                                    placeholder="Digite apenas os números do CPF" value={cpfVoto} 
                                    onChange={(e) => setCpfVoto(e.target.value)} disabled={!sessaoAberta} 
                                    className="bg-white border-slate-300 focus-visible:ring-emerald-600"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Button onClick={() => votar('SIM')} disabled={!sessaoAberta || !cpfVoto} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-14 text-base gap-2 shadow-sm disabled:opacity-50"><CheckCircle2 className="w-5 h-5" /> SIM</Button>
                                <Button onClick={() => votar('NAO')} disabled={!sessaoAberta || !cpfVoto} className="bg-rose-600 hover:bg-rose-500 text-white font-bold h-14 text-base gap-2 shadow-sm disabled:opacity-50"><XCircle className="w-5 h-5" /> NÃO</Button>
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
                                    <strong className="text-slate-900">{total}</strong>
                                </div>
                                
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex my-2">
                                    <div style={{ width: `${pctSim}%` }} className="bg-emerald-600 transition-all duration-500" />
                                    <div style={{ width: `${pctNao}%` }} className="bg-rose-600 transition-all duration-500" />
                                </div>

                                <div className="flex justify-between items-center text-sm p-2 bg-emerald-50 rounded text-emerald-800">
                                    <span>Votos SIM:</span>
                                    <strong>{sim} ({pctSim}%)</strong>
                                </div>
                                <div className="flex justify-between items-center text-sm p-2 bg-rose-50 rounded text-rose-800">
                                    <span>Votos NÃO:</span>
                                    <strong>{nao} ({pctNao}%)</strong>
                                </div>
                                <div className="pt-2 text-center">
                                    {total > 0 ? (
                                        <Badge className={sim > nao ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}>
                                            {sim > nao ? 'Aprovada' : 'Rejeitada'}
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-slate-300 text-slate-700">Aguardando Votos</Badge>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 text-center py-8 italic">Resultados consolidados aparecem aqui.</p>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button onClick={recarregar} variant="outline" className="w-full text-xs text-slate-600">Atualizar Apuração</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}