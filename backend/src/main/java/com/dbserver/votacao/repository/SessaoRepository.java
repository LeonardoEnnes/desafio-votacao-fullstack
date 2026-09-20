package com.dbserver.votacao.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.dbserver.votacao.domain.Sessao;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SessaoRepository extends JpaRepository<Sessao, UUID> {
    Optional<Sessao> findById(UUID id);
    Optional<Sessao> findByPautaId(UUID pautaId);
    List<Sessao> findByDataAberturaBeforeAndDataFechamentoAfter(LocalDateTime agora1, LocalDateTime agora2);
    boolean existsByPautaId(UUID id);
}
