import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  fotoPerfil: string;
  fechaRegistro: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/auth';
  private readonly STORAGE_KEY = 'vida_en_red_usuario';

  usuarioActual = signal<Usuario | null>(this.leerSesionGuardada());

  registrar(datos: { nombre: string; correo: string; password: string; telefono: string }): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/registro`, datos).pipe(
      tap(usuario => this.guardarSesion(usuario))
    );
  }

  login(credenciales: { correo: string; password: string }): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/login`, credenciales).pipe(
      tap(usuario => this.guardarSesion(usuario))
    );
  }

  actualizarPerfil(id: number, datos: { nombre: string; telefono: string; fotoPerfil: string }): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/perfil/${id}`, datos).pipe(
      tap(usuarioActualizado => this.guardarSesion(usuarioActualizado))
    );
  }

  cambiarPassword(id: number, datos: { passwordActual: string; passwordNueva: string }): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.apiUrl}/password/${id}`, datos);
  }

  cerrarSesion() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.usuarioActual.set(null);
  }

  private guardarSesion(usuario: Usuario) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuario));
    this.usuarioActual.set(usuario);
  }

  private leerSesionGuardada(): Usuario | null {
    const guardado = localStorage.getItem(this.STORAGE_KEY);
    return guardado ? JSON.parse(guardado) : null;
  }
}