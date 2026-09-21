package com.dbserver.votacao.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    @Query("SELECT s FROM Sessao s WHERE :agora BETWEEN s.dataAbertura AND s.dataFechamento")
    List<Sessao> findSessoesAbertas(@Param("agora") LocalDateTime agorinha);
    boolean existsByPautaId(UUID id);
}
