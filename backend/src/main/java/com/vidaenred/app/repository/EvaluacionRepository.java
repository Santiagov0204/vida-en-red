package com.vidaenred.app.repository;

import com.vidaenred.app.model.Evaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface EvaluacionRepository extends JpaRepository<Evaluacion, Long> {
    List<Evaluacion> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);
    boolean existsByUsuarioIdAndFechaCreacionBetween(Long usuarioId, LocalDateTime inicio, LocalDateTime fin);
}