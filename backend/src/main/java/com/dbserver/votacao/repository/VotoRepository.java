package com.dbserver.votacao.repository;

import com.dbserver.votacao.domain.enums.VotoEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.dbserver.votacao.domain.Voto;
import java.util.UUID;

@Repository
public interface VotoRepository extends JpaRepository<Voto, UUID> {
    boolean existsByPautaIdAndAssociadoId(UUID pautaId, UUID associadoId);
    long countByPautaId(UUID pautaId);
    long countByPautaIdAndValor(UUID pautaId, VotoEnum valor);
}