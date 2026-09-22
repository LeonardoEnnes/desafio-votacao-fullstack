import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { IdCard, UserCheck } from 'lucide-react';
import { mascararCpf } from '@/utils/format';
import { useIdentificarAssociado } from '@/hooks/useIdentificarAssociado';

export function AreaAssociado() {
    const { cpf, input, setInput, erro, loading, identificar, sair } = useIdentificarAssociado();

    return (
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
                    {cpf ? (
                        <div className="flex items-center justify-between sm:justify-start gap-4 bg-white px-4 py-2 border border-emerald-200 rounded-lg shadow-sm">
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                <UserCheck className="w-5 h-5 text-emerald-600" />
                                CPF logado: <strong>{mascararCpf(cpf)}</strong>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-400 hover:text-rose-600 h-8"
                                onClick={sair}
                            >
                                Sair
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={identificar} className="flex flex-col sm:flex-row gap-2">
                            <div className="flex flex-col gap-1 w-full sm:w-64">
                                <Input
                                    placeholder="Digite seu CPF (apenas números)"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value.replace(/\D/g, ''))}
                                    maxLength={11}
                                    disabled={loading}
                                    className="bg-white border-slate-300 focus-visible:ring-emerald-600"
                                />
                                {erro && <span className="text-xs text-rose-600 font-medium ml-1">{erro}</span>}
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                            >
                                {loading ? 'Validando...' : 'Entrar'}
                            </Button>
                        </form>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}