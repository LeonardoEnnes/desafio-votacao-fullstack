package com.dbserver.votacao.client;

import com.dbserver.votacao.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.concurrent.ThreadLocalRandom;
import java.util.function.BooleanSupplier;

@Component
public class FakeValidadorCpfExternoClient implements ValidadorCpfExternoClient {

    private final ValidadorDeCpf ValidadorDeCpf;
    private final BooleanSupplier resultadoElegibilidade;

    @Autowired
    public FakeValidadorCpfExternoClient(ValidadorDeCpf validadorCpfMatematico) {
        this.ValidadorDeCpf = validadorCpfMatematico;
        this.resultadoElegibilidade = () -> ThreadLocalRandom.current().nextBoolean();
    }

    public FakeValidadorCpfExternoClient(ValidadorDeCpf validadorCpfMatematico, BooleanSupplier resultadoElegibilidade) {
        this.ValidadorDeCpf = validadorCpfMatematico;
        this.resultadoElegibilidade = resultadoElegibilidade;
    }

    @Override
    public ElegibilidadeVoto verificarElegibilidade(String cpf) {
        if (!ValidadorDeCpf.isValido(cpf)) {
            throw new ResourceNotFoundException("CPF inválido ou não encontrado no sistema externo.");
        }

        return resultadoElegibilidade.getAsBoolean()
                ? ElegibilidadeVoto.ABLE_TO_VOTE
                : ElegibilidadeVoto.UNABLE_TO_VOTE;
    }
}