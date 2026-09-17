package com.dbserver.votacao.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.dbserver.votacao.domain.Associado;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssociadoRepository extends JpaRepository<Associado, UUID> {
    Optional<Associado> findByCpf(String cpf);
}
