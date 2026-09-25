package com.dbserver.votacao.client;

import com.dbserver.votacao.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.BooleanSupplier;

@Component
public class FakeValidadorCpfExternoClient implements ValidadorCpfExternoClient {

    private final ValidadorDeCpf validadorDeCpf;
    private final BooleanSupplier resultadoElegibilidade;

    @Autowired
    public FakeValidadorCpfExternoClient(ValidadorDeCpf validadorDeCpf, Environment env) {
        this.validadorDeCpf = validadorDeCpf;

        boolean isPerf = java.util.Arrays.asList(env.getActiveProfiles()).contains("perf"); // verifica se o profile 'perf' esta ativo no ambiente

        if (isPerf) {
            this.resultadoElegibilidade = () -> true; // para deixar 100% dos cps elegiveis nos testes de performance
        } else {
            this.resultadoElegibilidade = () -> ThreadLocalRandom.current().nextBoolean();
        }
    }

    public FakeValidadorCpfExternoClient(ValidadorDeCpf validadorDeCpf, BooleanSupplier resultadoElegibilidade) {
        this.validadorDeCpf = validadorDeCpf;
        this.resultadoElegibilidade = resultadoElegibilidade;
    }

    @Override
    public ElegibilidadeVoto verificarElegibilidade(String cpf) {
        if (!validadorDeCpf.isValido(cpf)) {
            throw new ResourceNotFoundException("CPF inválido ou não encontrado no sistema externo.");
        }

        return resultadoElegibilidade.getAsBoolean()
                ? ElegibilidadeVoto.ABLE_TO_VOTE
                : ElegibilidadeVoto.UNABLE_TO_VOTE;
    }
}