import { Component, OnInit, inject, signal } from '@angular/core';
import { EvaluacionService, EvaluacionResponse } from '../../services/evaluacion';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cuestionario',
  templateUrl: './cuestionario.html',
  styleUrl: './cuestionario.css',
  imports: [RouterLink]
})
export class Cuestionario implements OnInit {
  private evaluacionService = inject(EvaluacionService);

  preguntas = [
    '1. ¿Has sentido poco interés o placer al hacer las cosas que normalmente disfrutas?',
    '2. ¿Te has sentido decaído(a), deprimido(a) o sin esperanza?',
    '3. ¿Has tenido dificultad para conciliar el sueño, mantenerlo o has dormido demasiado?',
    '4. ¿Te has sentido nervioso(a), ansioso(a) o con los nervios de punta?',
    '5. ¿Has sentido que te cuesta concentrarte o manejar las preocupaciones diarias?'
  ];

  opciones = [
    { texto: 'Nunca', puntos: 0 },
    { texto: 'Varios días', puntos: 1 },
    { texto: 'Más de la mitad de los días', puntos: 2 },
    { texto: 'Casi todos los días', puntos: 3 }
  ];

  respuestas = signal<(number | null)[]>([null, null, null, null, null]);
  resultado = signal<EvaluacionResponse | null>(null);
  cargando = signal<boolean>(false);
  error = signal<string | null>(null);
  totalComunidad = signal<number>(0);

  ngOnInit() {
    this.evaluacionService.obtenerTotal().subscribe({
      next: (total) => this.totalComunidad.set(total)
    });
  }

  seleccionarOpcion(indicePregunta: number, puntos: number) {
    this.respuestas.update(actuales => {
      const copia = [...actuales];
      copia[indicePregunta] = puntos;
      return copia;
    });
  }

  todasRespondidas(): boolean {
    return this.respuestas().every(r => r !== null);
  }

  enviarTest() {
    if (!this.todasRespondidas()) return;

    const puntajeTotal = this.respuestas().reduce((suma: number, val) => suma + (val ?? 0), 0);
    this.cargando.set(true);
    this.error.set(null);

    this.evaluacionService.enviarEvaluacion(puntajeTotal).subscribe({
      next: (respuesta) => {
        this.resultado.set(respuesta);
        this.totalComunidad.update(actual => actual + 1);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo conectar con Spring Boot. Verifica que el backend esté encendido en el puerto 8080.');
        this.cargando.set(false);
      }
    });
  }

  reiniciar() {
    this.respuestas.set([null, null, null, null, null]);
    this.resultado.set(null);
    this.error.set(null);
  }
}