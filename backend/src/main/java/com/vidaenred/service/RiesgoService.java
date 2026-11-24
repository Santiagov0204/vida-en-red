package com.vidaenred.app.service;

import com.vidaenred.app.model.AlertaSos;
import com.vidaenred.app.model.Evaluacion;
import com.vidaenred.app.model.Usuario;
import com.vidaenred.app.repository.AlertaSosRepository;
import com.vidaenred.app.repository.EvaluacionRepository;
import com.vidaenred.app.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RiesgoService {

    private final EvaluacionRepository evaluacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final AlertaSosRepository alertaSosRepository;

    public RiesgoService(
            EvaluacionRepository evaluacionRepository,
            UsuarioRepository usuarioRepository,
            AlertaSosRepository alertaSosRepository) {
        this.evaluacionRepository = evaluacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.alertaSosRepository = alertaSosRepository;
    }

    public boolean yaEvaluoHoy(Long usuarioId) {
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        LocalDateTime finDia = LocalDate.now().plusDays(1).atStartOfDay();
        return evaluacionRepository.existsByUsuarioIdAndFechaCreacionBetween(usuarioId, inicioDia, finDia);
    }

    public Evaluacion evaluar(int puntuacion, Long usuarioId) {
        if (usuarioId != null && yaEvaluoHoy(usuarioId)) {
            throw new IllegalStateException("Ya realizaste tu evaluación diaria.");
        }

        Evaluacion evaluacion = new Evaluacion();
        evaluacion.setPuntuacionTotal(puntuacion);
        evaluacion.setCiudad("Ibagué");

        if (puntuacion <= 4) {
            evaluacion.setNivelRiesgo("BAJO");
        } else if (puntuacion <= 9) {
            evaluacion.setNivelRiesgo("MEDIO");
        } else {
            evaluacion.setNivelRiesgo("ALTO");
        }

        if (usuarioId != null) {
            usuarioRepository.findById(usuarioId).ifPresent(evaluacion::setUsuario);
        }

        return evaluacionRepository.save(evaluacion);
    }

    public AlertaSos activarAlertaSos(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

        AlertaSos alerta = new AlertaSos();
        alerta.setUsuario(usuario);
        alerta.setTelefonoContacto(usuario.getTelefono());
        return alertaSosRepository.save(alerta);
    }

    public List<Evaluacion> obtenerTodas() {
        return evaluacionRepository.findAll();
    }

    public long contarEvaluaciones() {
        return evaluacionRepository.count();
    }

    public List<Evaluacion> obtenerPorUsuario(Long usuarioId) {
        return evaluacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId);
    }
}