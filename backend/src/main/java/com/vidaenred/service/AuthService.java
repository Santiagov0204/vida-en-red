package com.vidaenred.app.service; // <-- Ajusta a tu paquete

import com.vidaenred.app.model.Usuario;
import com.vidaenred.app.repository.UsuarioRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public Usuario registrar(Usuario nuevoUsuario) {
        if (usuarioRepository.findByCorreo(nuevoUsuario.getCorreo()).isPresent()) {
            throw new RuntimeException("Este correo ya está registrado.");
        }
        // Encriptamos la contraseña antes de guardarla en PostgreSQL
        String claveEncriptada = passwordEncoder.encode(nuevoUsuario.getPassword());
        nuevoUsuario.setPassword(claveEncriptada);

        return usuarioRepository.save(nuevoUsuario);
    }

    public Usuario login(String correo, String password) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Correo o contraseña incorrectos."));

        // Comparamos la clave escrita con la huella encriptada en la base de datos
        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            throw new RuntimeException("Correo o contraseña incorrectos.");
        }

        return usuario;
    }
    
    public Usuario actualizarPerfil(Long id, String nombre, String telefono, String fotoPerfil) {
    Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

    if (nombre != null && !nombre.isBlank()) usuario.setNombre(nombre);
    if (telefono != null && !telefono.isBlank()) usuario.setTelefono(telefono);
    if (fotoPerfil != null && !fotoPerfil.isBlank()) usuario.setFotoPerfil(fotoPerfil);

    return usuarioRepository.save(usuario);
}

public void cambiarPassword(Long id, String passwordActual, String passwordNueva) {
    Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

    if (!passwordEncoder.matches(passwordActual, usuario.getPassword())) {
        throw new RuntimeException("La contraseña actual no es correcta.");
    }

    usuario.setPassword(passwordEncoder.encode(passwordNueva));
    usuarioRepository.save(usuario);
}
}