import { Component, ViewChild, ElementRef, contentChild, inject, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { MensajeChat } from '../../../models/chat';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';
import { AuthService } from '../../services/auth';
import { ChatService } from '../../services/chat';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'firebase/auth';
import { compileNgModule } from '@angular/compiler';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy, AfterViewChecked {

  private authService = inject(AuthService)
  private chatService = inject(ChatService)
  private router = inject(Router)

  manejoErrorImagen(evento: any): void{
    evento.target.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStK42Zu3SaaurfvodAw-os-fFoPzKnUmc6Tw&s"
  }

  usuario : User | null = null
  mensajes: MensajeChat[] = []
  cargandoHistorial = false
  asistenteEscribiendo = false
  enviandoMensaje = false
  mensajeTexto=""
  mensajeError = ""

  private suscripciones : Subscription[] = []

  private async verificarAutenticacion(): Promise<void>{
    // a la variable usuario le voy a asignar el servicio de auth y la funcion de obtener usuario
    this.usuario = this.authService.obtenerUsuario()
    if (!this.usuario){
      await this.router.navigate(['/auth'])
      throw new Error('Usuario no autenticado')
    } 
  }

  private async inicializarChat(): Promise<void> {
    if(!this.usuario){
      return;
    }
    this.cargandoHistorial = true;
    try {
      await this.chatService.inicializarChat(this.usuario.uid)
    } catch (error) {
      console.error('Error al inicializar')
      throw error;
    }finally{
      this.cargandoHistorial = false
    }
  }


  private configurarSuscripciones(): void{
    const submensajes = this.chatService.mensajes$.subscribe( mensajes=>{
      this.mensajes = mensajes;
      this.debeHacerScroll = true;
    });

    const Submensajesasis = this.chatService.asistenteRespondiendo$.subscribe( respondiendo => {
      this.asistenteEscribiendo = respondiendo;
      if(respondiendo){
        this.debeHacerScroll = true
      }
    });

    this.suscripciones.push(submensajes, Submensajesasis)
  }

  private debeHacerScroll: boolean = false;

  @ViewChild('messagesContainer') messagesContainer! : ElementRef
  @ViewChild('mensajeInput') mensajeInput! : ElementRef

  private scrollhaciaabajo():void{
    try{
      const container = this.messagesContainer?.nativeElement
      if(container){
        container.scrollTop = container.scrollHeight
      }
    } catch(error){
      console.error('❌ Error al hacer scroll')
    }
  }


  ngAfterViewChecked():void{
    if(this.debeHacerScroll){
      this.scrollhaciaabajo();
      this.debeHacerScroll = false
    }
  }
  trackByMensaje(index: number, mensaje: MensajeChat){
    return mensaje.id || `${mensaje.tipo} - ${mensaje.fechaEnvio.getTime()}`
  }

  formatearMensajeAsistente(contenido:string){
    return contenido
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
  }

  formatearhora(fecha: Date): string{
    return fecha.toLocaleDateString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  private enfocarInput():void{
    setTimeout(()=>{
      this.mensajeInput.nativeElement.focus();
    }, 100);
  }

  async enviarMensaje(): Promise<void>{
    if(!this.mensajeTexto.trim()){
      return;
    }

    this.mensajeError=""
    this.enviandoMensaje = true;

    // es guardando el mensaje en la variable texto
    const texto = this.mensajeTexto.trim();
    // limpiar el input
    this.mensajeTexto=""

    try{

      await this.chatService.enviarMensaje(texto);
      this.enfocarInput();

    }catch(error: any){
      console.error('Error al enviar el mensaje')

      this.mensajeError = error.message || 'Error al enviar el mensaje'
      this.mensajeTexto = texto;
    }finally{
      this.enviandoMensaje = false;
    }
  }
  async ngOnInit(): Promise<void>{
    try {
      await this.verificarAutenticacion();
      await this.inicializarChat();

      this.configurarSuscripciones();

    } catch (error) {
      console.error('Error al inicializar el chat OnInit')
      this.mensajeError= "Error al cargar el chat. Intente recargar lapagina"
      throw error;
    }
  }

  ngOnDestroy():void{
    this.suscripciones.forEach(sub => sub.unsubscribe)
  }

  manejarTeclaPresionada(event: KeyboardEvent){
    if(event.key === "Enter" && !event.shiftKey){
      event.preventDefault();
      this.enviarMensaje()
    }
  }
  async cerrarSesion(): Promise<void>{
    try {
      this.chatService.limpiarChat();

      await this.authService.cerrarSesion();

      await this.router.navigate(['/auth']);
    } catch (error) {
      console.error('Error al cerrar la sesion desde el componente')
      this.mensajeError = 'Error al cerrar la sesion'
      throw error;
    }
  }



  
}


