import { Routes } from '@angular/router';
import { Cuestionario } from './pages/cuestionario/cuestionario';
import { Panel } from './pages/panel/panel';
import { Access } from './pages/access/access';
import { Perfil } from './pages/perfil/perfil';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Cuestionario, title: 'Vida en Red — Ibagué' },
  { path: 'acceso', component: Access, title: 'Iniciar Sesión — Vida en Red' },
  { path: 'perfil', component: Perfil, canActivate: [authGuard], title: 'Mi Perfil — Vida en Red' },
  { path: 'panel', component: Panel, title: 'Panel de Monitoreo — Vida en Red' },
  { path: '**', redirectTo: '' }
];