package com.dbserver.votacao.client;

public interface ValidadorCpfExternoClient {
    ElegibilidadeVoto verificarElegibilidade(String cpf);
}
