import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EvaluacionResponse {
  id: number;
  puntuacionTotal: number;
  nivelRiesgo: string;
  ciudad: string;
  fechaCreacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class EvaluacionService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/evaluaciones';

  enviarEvaluacion(puntuacion: number, usuarioId?: number): Observable<EvaluacionResponse> {
    return this.http.post<EvaluacionResponse>(`${this.baseUrl}/evaluar`, { puntuacion, usuarioId });
  }

  verificarEstadoHoy(usuarioId: number): Observable<{ yaEvaluoHoy: boolean }> {
    return this.http.get<{ yaEvaluoHoy: boolean }>(`${this.baseUrl}/estado-hoy/${usuarioId}`);
  }

  activarAlertaSos(usuarioId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/sos/${usuarioId}`, {});
  }

  obtenerTotal(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/total`);
  }

  obtenerEvaluaciones(): Observable<EvaluacionResponse[]> {
    return this.http.get<EvaluacionResponse[]>(this.baseUrl);
  }

  obtenerPorUsuario(usuarioId: number): Observable<EvaluacionResponse[]> {
    return this.http.get<EvaluacionResponse[]>(`${this.baseUrl}/usuario/${usuarioId}`);
  }
}