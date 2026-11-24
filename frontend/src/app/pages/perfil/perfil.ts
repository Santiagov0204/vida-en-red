import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { EvaluacionService, EvaluacionResponse } from '../../services/evaluacion';

@Component({
  selector: 'app-perfil',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private evaluacionService = inject(EvaluacionService);
  private router = inject(Router);

  pestana = signal<'bienestar' | 'historial' | 'ajustes'>('bienestar');

  frases = [
    '«Pedir ayuda no es rendirse; es negarse a rendirse en soledad.»',
    '«No tienes que poder con todo hoy. Respira: un paso a la vez sigue siendo avanzar.»',
    '«Tu historia aún tiene capítulos que merecen ser vividos. Estamos aquí contigo.»',
    '«Incluso en los días nublados sobre el Nevado, el sol sigue estando ahí arriba.»',
    '«Hablar de lo que duele le quita peso al silencio. Tu voz importa.»'
  ];
  indiceFrase = signal<number>(0);

  articulos = [
    {
      titulo: 'Técnica 5-4-3-2-1 para calmar la ansiedad en 2 minutos',
      resumen: 'Ancla tu mente al presente usando tus cinco sentidos cuando sientas desbordamiento emocional.',
      lectura: '3 min de lectura',
      url: 'https://www.minsalud.gov.co/salud/publica/SMental/Paginas/salud-mental.aspx'
    },
    {
      titulo: '¿Cómo hablar con alguien de confianza sobre cómo me siento?',
      resumen: 'Frases sencillas para iniciar esa conversación difícil con un amigo, familiar o profesional.',
      lectura: '4 min de lectura',
      url: 'https://www.who.int/es/news-room/fact-sheets/detail/depression'
    },
    {
      titulo: 'Higiene del sueño y descanso emocional',
      resumen: 'Pequeños ajustes nocturnos para reducir el agotamiento mental y recuperar energía.',
      lectura: '5 min de lectura',
      url: 'https://www.paho.org/es/temas/salud-mental'
    }
  ];

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
    { texto: 'Más de la mitad', puntos: 2 },
    { texto: 'Casi todos los días', puntos: 3 }
  ];

  respuestas = signal<(number | null)[]>([null, null, null, null, null]);
  resultadoReciente = signal<EvaluacionResponse | null>(null);
  enviandoTest = signal<boolean>(false);

  // --- Regla 1 encuesta/día y Alerta SOS ---
  yaEvaluoHoy = signal<boolean>(false);
  respuestaTranquilidad = signal<boolean>(false);
  llamadaActiva = signal<boolean>(false);
  estadoLlamada = signal<'timbrando' | 'conectada'>('timbrando');
  segundosLlamada = signal<number>(0);
  private intervaloLlamada: any = null;
  private timeoutConexion: any = null;

  // --- Historial propio ---
  misEvaluaciones = signal<EvaluacionResponse[]>([]);
  cargandoHistorial = signal<boolean>(false);

  // --- Ajustes de perfil ---
  avataresDisponibles = ['🌿', '🌊', '☀️', '🕊️', '💙', '🌱'];
  editNombre = '';
  editTelefono = '';
  editFoto = '🌿';
  mensajePerfil = signal<string | null>(null);

  passwordActual = '';
  passwordNueva = '';
  mensajePassword = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  ngOnInit() {
    const user = this.authService.usuarioActual();
    if (user) {
      this.editNombre = user.nombre;
      this.editTelefono = user.telefono || '';
      this.editFoto = user.fotoPerfil && user.fotoPerfil !== 'avatar-default' ? user.fotoPerfil : '🌿';
      this.cargarMisEvaluaciones();
      this.comprobarEstadoDiario(user.id);
    }
  }

  ngOnDestroy() {
    this.limpiarTemporizadores();
  }

  comprobarEstadoDiario(userId: number) {
    this.evaluacionService.verificarEstadoHoy(userId).subscribe({
      next: (res) => this.yaEvaluoHoy.set(res.yaEvaluoHoy)
    });
  }

  siguienteFrase() {
    this.indiceFrase.update(i => (i + 1) % this.frases.length);
  }

  cargarMisEvaluaciones() {
    const userId = this.authService.usuarioActual()?.id;
    if (!userId) return;

    this.cargandoHistorial.set(true);
    this.evaluacionService.obtenerPorUsuario(userId).subscribe({
      next: (datos) => {
        this.misEvaluaciones.set(datos);
        this.cargandoHistorial.set(false);
      },
      error: () => this.cargandoHistorial.set(false)
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

  enviarEncuestaPersonal() {
    const userId = this.authService.usuarioActual()?.id;
    if (!this.todasRespondidas() || !userId) return;

    const puntajeTotal = this.respuestas().reduce((suma: number, val) => suma + (val ?? 0), 0);
    this.enviandoTest.set(true);

    this.evaluacionService.enviarEvaluacion(puntajeTotal, userId).subscribe({
      next: (res) => {
        this.resultadoReciente.set(res);
        this.yaEvaluoHoy.set(true);
        this.enviandoTest.set(false);
        this.cargarMisEvaluaciones();
      },
      error: (err) => {
        this.enviandoTest.set(false);
        if (err.status === 409) {
          this.yaEvaluoHoy.set(true);
        }
      }
    });
  }

  // --- Simulación de llamada automática SOS ---
  dispararAlarmaSos() {
    const userId = this.authService.usuarioActual()?.id;
    if (!userId) return;

    this.evaluacionService.activarAlertaSos(userId).subscribe();

    this.llamadaActiva.set(true);
    this.estadoLlamada.set('timbrando');
    this.segundosLlamada.set(0);

    this.timeoutConexion = setTimeout(() => {
      this.estadoLlamada.set('conectada');
      this.intervaloLlamada = setInterval(() => {
        this.segundosLlamada.update(s => s + 1);
      }, 1000);
    }, 3000);
  }

  colgarLlamada() {
    this.limpiarTemporizadores();
    this.llamadaActiva.set(false);
    this.segundosLlamada.set(0);
  }

  formatearTiempo(totalSegundos: number): string {
    const mins = Math.floor(totalSegundos / 60).toString().padStart(2, '0');
    const segs = (totalSegundos % 60).toString().padStart(2, '0');
    return `${mins}:${segs}`;
  }

  private limpiarTemporizadores() {
    if (this.timeoutConexion) clearTimeout(this.timeoutConexion);
    if (this.intervaloLlamada) clearInterval(this.intervaloLlamada);
  }

  guardarCambiosPerfil() {
    const userId = this.authService.usuarioActual()?.id;
    if (!userId) return;

    this.authService.actualizarPerfil(userId, {
      nombre: this.editNombre,
      telefono: this.editTelefono,
      fotoPerfil: this.editFoto
    }).subscribe({
      next: () => {
        this.mensajePerfil.set('¡Datos de perfil actualizados!');
        setTimeout(() => this.mensajePerfil.set(null), 3000);
      }
    });
  }

  actualizarClave() {
    const userId = this.authService.usuarioActual()?.id;
    if (!userId || !this.passwordActual || !this.passwordNueva) return;

    this.authService.cambiarPassword(userId, {
      passwordActual: this.passwordActual,
      passwordNueva: this.passwordNueva
    }).subscribe({
      next: (res) => {
        this.mensajePassword.set({ tipo: 'ok', texto: res.mensaje });
        this.passwordActual = '';
        this.passwordNueva = '';
      },
      error: (err) => {
        this.mensajePassword.set({
          tipo: 'error',
          texto: err.error?.error || 'No se pudo cambiar la contraseña.'
        });
      }
    });
  }

  salir() {
    this.authService.cerrarSesion();
    this.router.navigate(['/']);
  }
}