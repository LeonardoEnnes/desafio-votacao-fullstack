package com.dbserver.votacao.domain;

import com.dbserver.votacao.domain.enums.VotoEnum;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import java.util.UUID;
import lombok.*;

@Entity
@Table(
        name = "voto",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"pauta_id", "associado_id"}, name = "uk_associado_pauta")
        },
        indexes = {
                @Index(name = "idx_voto_associado_id", columnList = "associado_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pauta_id", nullable = false)
    private Pauta pauta;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "associado_id", nullable = false)
    private Associado associado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 3)
    private VotoEnum valor;

    @Column(name = "data_voto", nullable = false, updatable = false)
    private LocalDateTime dataVoto;

    @PrePersist
    protected void onCreate() {
        this.dataVoto = LocalDateTime.now();
    }
}
