import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-access',
  imports: [FormsModule, RouterLink],
  templateUrl: './access.html',
  styleUrl: './access.css'
})
export class Access {
  private authService = inject(AuthService);
  private router = inject(Router);

  modoRegistro = signal<boolean>(false);
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);

  nombre = '';
  correo = '';
  telefono = '';
  password = '';

  alternarModo() {
    this.modoRegistro.update(actual => !actual);
    this.error.set(null);
  }

  procesarFormulario() {
    this.error.set(null);
    this.cargando.set(true);

    if (this.modoRegistro()) {
      this.authService.registrar({
        nombre: this.nombre,
        correo: this.correo,
        telefono: this.telefono,
        password: this.password
      }).subscribe({
        next: () => {
          this.cargando.set(false);
          this.router.navigate(['/perfil']);
        },
        error: (err) => {
          this.cargando.set(false);
          this.error.set(err.error?.error || 'No se pudo completar el registro.');
        }
      });
    } else {
      this.authService.login({
        correo: this.correo,
        password: this.password
      }).subscribe({
        next: () => {
          this.cargando.set(false);
          this.router.navigate(['/perfil']);
        },
        error: (err) => {
          this.cargando.set(false);
          this.error.set(err.error?.error || 'Correo o contraseña incorrectos.');
        }
      });
    }
  }
}