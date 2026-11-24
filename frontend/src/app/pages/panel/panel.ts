import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EvaluacionService, EvaluacionResponse } from '../../services/evaluacion';

@Component({
  selector: 'app-panel',
  imports: [DatePipe, RouterLink],
  templateUrl: './panel.html',
  styleUrl: './panel.css'
})
export class Panel implements OnInit {
  private evaluacionService = inject(EvaluacionService);

  historial = signal<EvaluacionResponse[]>([]);
  cargandoHistorial = signal<boolean>(false);

  estadisticas = computed(() => {
    const lista = this.historial();
    return {
      total: lista.length,
      bajo: lista.filter(e => e.nivelRiesgo === 'BAJO').length,
      medio: lista.filter(e => e.nivelRiesgo === 'MEDIO').length,
      alto: lista.filter(e => e.nivelRiesgo === 'ALTO').length
    };
  });

  ngOnInit() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.cargandoHistorial.set(true);
    this.evaluacionService.obtenerEvaluaciones().subscribe({
      next: (datos) => {
        this.historial.set([...datos].reverse());
        this.cargandoHistorial.set(false);
      },
      error: () => this.cargandoHistorial.set(false)
    });
  }
}