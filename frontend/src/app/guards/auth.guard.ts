import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.usuarioActual()) {
    return true; // Hay sesión activa, puede pasar
  }

  return router.createUrlTree(['/acceso']); // Bloqueado: lo envía al login
};