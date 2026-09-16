package com.dbserver.votacao.domain;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "sessao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sessao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pauta_id", nullable = false, unique = true)
    private Pauta pauta;

    @Column(name = "data_abertura", nullable = false)
    private LocalDateTime dataAbertura;

    @Column(name = "data_fechamento", nullable = false)
    private LocalDateTime dataFechamento;

    public boolean estaEncerrada() {
        return LocalDateTime.now().isAfter(this.dataFechamento);
    }
}
