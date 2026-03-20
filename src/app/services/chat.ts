import { Injectable, inject } from '@angular/core';
import { MensajeChat } from '../../models/chat';
import { AuthService } from './auth';
import { GeminiService } from './gemini';
import { FirebaseService } from './firebase';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

// vamos a generar un mock del servicio de gemini
const geminiService = {
  convertirHistorialGemini: (historial: MensajeChat[])=> historial,
  enviarMensaje : async(contenido: string, historial: any)=> 'Respuesta desde el servicio de gemini de tipo Mock, esta respuesta siempre va a ser igual'
}

@Injectable({
  providedIn: 'root',
})

export class ChatService {
  private authService = inject(AuthService)
  private firebaseService =  inject(FirebaseService)
  private geminiService = inject(GeminiService)

  private mensajeSubject = new BehaviorSubject<MensajeChat[]>([]);
  public mensajes$ = this.mensajeSubject.asObservable();

  private cargandoHistorial = false;

  private asistenteRespondiendo =  new BehaviorSubject<boolean>(false);
  public asistenteRespondiendo$ = this.asistenteRespondiendo.asObservable();

  async inicializarChat(usuarioId: string):Promise<void>{
    if(this.cargandoHistorial){
      return;
    }
    this.cargandoHistorial = true;
    try{
      this.firebaseService.obtenerMensajesusuario(usuarioId).subscribe({
        next : (mensajes)=>{
          // actualizando el behaviorsubject
          this.mensajeSubject.next(mensajes)
          this.cargandoHistorial = false;
        },
        error : (error)=>{
          console.log("Error al cargar el historial", error)
          this.cargandoHistorial = false;
          // cargar con una lista vacia el behavior subject
          this.mensajeSubject.next([]);
        }
      })
    }catch(error){
      console.error('Error al cargar el historial', error)
      throw error;
      this.cargandoHistorial = false;
      this.mensajeSubject.next([]);
    }
  }
  async enviarMensaje(contenidoMensaje: string): Promise<void> {
    const usuarioActual = this.authService.obtenerUsuario();

    if (!usuarioActual || !contenidoMensaje.trim()) return;

    const mensajeUsuario: MensajeChat = {
      usuarioId: usuarioActual.uid,
      contenido: contenidoMensaje.trim(),
      fechaEnvio: new Date(),
      estado: 'Enviado',
      tipo: 'Usuario',
    };

    try {
    // 1. Actualizar UI inmediatamente
    this.mensajeSubject.next([...this.mensajeSubject.value, mensajeUsuario]);
    
    // 2. Guardar en Firebase (fuego y olvido o esperar)
    await this.firebaseService.guardarMensaje(mensajeUsuario).catch(e => 
      console.error('Error guardando en Firebase:', e)
    );

    this.asistenteRespondiendo.next(true);

    // 3. Obtener respuesta de Gemini
    const historialParaGemini = this.geminiService.convertirHistorialGemini(
      this.mensajeSubject.value.slice(-6)
    );

    const respuestaDelAsistente = await firstValueFrom(
      this.geminiService.enviarMensaje(contenidoMensaje, historialParaGemini)
    );

    const mensajeAsistente: MensajeChat = {
      usuarioId: usuarioActual.uid,
      contenido: respuestaDelAsistente,
      fechaEnvio: new Date(),
      estado: 'Enviado',
      tipo: 'Asistente',
    };

    // 4. Actualizar UI con respuesta
    this.mensajeSubject.next([...this.mensajeSubject.value, mensajeAsistente]);
    await this.firebaseService.guardarMensaje(mensajeAsistente);

    } catch (error: any) {
      console.error('Error al procesar el mensaje', error); 
      const mensajeError: MensajeChat = {
        usuarioId: usuarioActual?.uid || '',
        contenido: error.message || 'Lo sentimos, no se pudo procesar el mensaje',
        fechaEnvio: new Date(),
        estado: 'Error',
        tipo: 'Asistente',
      };

      // Actualizamos el Subject para que el usuario vea el error en el chat
      this.mensajeSubject.next([...this.mensajeSubject.value, mensajeError]);
    
      // Intentamos persistir el error en Firebase
      await this.firebaseService.guardarMensaje(mensajeError).catch(e => console.log("Firebase Offline"));

    } finally {
      this.asistenteRespondiendo.next(false);
    }
  }
  limpiarChat(): void{
    this.mensajeSubject.next([]);
  }

  obtenerMensajes(): MensajeChat[]{
    return this.mensajeSubject.value
  }
}