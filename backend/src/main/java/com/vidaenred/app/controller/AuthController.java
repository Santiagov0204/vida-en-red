package com.vidaenred.app.controller; // <-- Ajusta a tu paquete

import com.vidaenred.app.model.Usuario;
import com.vidaenred.app.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        try {
            Usuario creado = authService.registrar(usuario);
            return ResponseEntity.ok(creado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        try {
            String correo = credenciales.get("correo");
            String password = credenciales.get("password");
            Usuario usuario = authService.login(correo, password);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }
    @PutMapping("/perfil/{id}")
    public ResponseEntity<?> actualizarPerfil(@PathVariable Long id, @RequestBody Map<String, String> datos) {
        try {
        Usuario actualizado = authService.actualizarPerfil(
                id,
                datos.get("nombre"),
                datos.get("telefono"),
                datos.get("fotoPerfil")
        );
        return ResponseEntity.ok(actualizado);
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
@PutMapping("/password/{id}")
public ResponseEntity<?> cambiarPassword(@PathVariable Long id, @RequestBody Map<String, String> datos) {
    try {
        authService.cambiarPassword(id, datos.get("passwordActual"), datos.get("passwordNueva"));
        return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada correctamente."));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

}