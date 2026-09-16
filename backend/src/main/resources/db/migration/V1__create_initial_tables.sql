CREATE TABLE pauta (
    id UUID PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    escricao TEXT,
    data_criacao TIMESTAMP NOT NULL
);

CREATE TABLE sessao (
    id UUID PRIMARY KEY,
    pauta_id UUID NOT NULL UNIQUE,
    data_abertura TIMESTAMP NOT NULL,
    data_fechamento TIMESTAMP NOT NULL,
    CONSTRAINT fk_sessao_pauta FOREIGN KEY (pauta_id) REFERENCES pauta(id) ON DELETE CASCADE
);

CREATE TABLE associado (
    id UUID PRIMARY KEY,
    cpf VARCHAR(11) NOT NULL UNIQUE
);

CREATE TABLE voto (
    id UUID PRIMARY KEY,
    pauta_id UUID NOT NULL,
    associado_id UUID NOT NULL,
    valor VARCHAR(10) NOT NULL,
    data_voto TIMESTAMP NOT NULL,
    CONSTRAINT fk_voto_pauta FOREIGN KEY (pauta_id) REFERENCES pauta(id) ON DELETE CASCADE,
    CONSTRAINT fk_voto_associado FOREIGN KEY (associado_id) REFERENCES associado(id) ON DELETE CASCADE,
    CONSTRAINT uk_associado_pauta UNIQUE (pauta_id, associado_id)
);