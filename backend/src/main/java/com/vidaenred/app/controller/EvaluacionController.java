package com.vidaenred.app.controller;

import com.vidaenred.app.model.AlertaSos;
import com.vidaenred.app.model.Evaluacion;
import com.vidaenred.app.service.RiesgoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evaluaciones")
@CrossOrigin(origins = "http://localhost:4200")
public class EvaluacionController {

    private final RiesgoService riesgoService;

    public EvaluacionController(RiesgoService riesgoService) {
        this.riesgoService = riesgoService;
    }

    @PostMapping("/evaluar")
    public ResponseEntity<?> evaluar(@RequestBody Map<String, Object> payload) {
        try {
            int puntuacion = Integer.parseInt(payload.get("puntuacion").toString());
            Long usuarioId = payload.get("usuarioId") != null
                    ? Long.valueOf(payload.get("usuarioId").toString())
                    : null;
            return ResponseEntity.ok(riesgoService.evaluar(puntuacion, usuarioId));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/estado-hoy/{usuarioId}")
    public Map<String, Boolean> verificarEstadoHoy(@PathVariable Long usuarioId) {
        return Map.of("yaEvaluoHoy", riesgoService.yaEvaluoHoy(usuarioId));
    }

    @PostMapping("/sos/{usuarioId}")
    public ResponseEntity<?> activarSos(@PathVariable Long usuarioId) {
        try {
            AlertaSos alerta = riesgoService.activarAlertaSos(usuarioId);
            return ResponseEntity.ok(alerta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public List<Evaluacion> listarTodas() {
        return riesgoService.obtenerTodas();
    }

    @GetMapping("/total")
    public long obtenerTotal() {
        return riesgoService.contarEvaluaciones();
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Evaluacion> listarPorUsuario(@PathVariable Long usuarioId) {
        return riesgoService.obtenerPorUsuario(usuarioId);
    }
}