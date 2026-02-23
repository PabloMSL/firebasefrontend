import { Component, ViewChild, ElementRef } from '@angular/core';
import { MensajeChat } from '../../../models/chat';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  nombre:string="Pablo Mozuca"
  email:string="pablomozuca@example.com"
  manejoErrorImagen(){
    console.log('Error al cargar la imagen del usuario');
  }
  mensajes: MensajeChat[] = []
  cargandoHistorial = false
  asistenteEscribiendo = true
  asistenteEnviando = false
  mensajeTexto=""
  enviandoMensaje = true
  cerrarSesion(){}
  private debeHacerScroll = true;

  @ViewChild('messagesContainer') messagesContainer! : ElementRef

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
  trackByMensaje(index: number, mensaje: MensajeChat){}

  formatearMensajeAsistente(mensaje:string){}

  enviarMensaje(){}

  ngOnInit(){
    this.mensajes = this.generarMensajeDemo();
  }

  private generarMensajeDemo():MensajeChat[]{
  const ahora =new Date();

  return [
    {
      id:'id1',
      contenido:'Hola eres el asistente?',
      tipo: 'Usuario',
      fechaEnvio: new Date(ahora.getTime()),
      estado: 'Enviado',
      usuarioId: 'u1'
    },{
      id:'id2',
      contenido:'Hola soy tu asistente',
      tipo: 'Asistente',
      fechaEnvio: new Date(ahora.getTime()),
      estado: 'Enviado',
      usuarioId: 'a1'
    },
    {
      id:'id3',
      contenido:'Dime una palabra aleatoria',
      tipo: 'Usuario',
      fechaEnvio: new Date(ahora.getTime()),
      estado: 'Enviado',
      usuarioId: 'u1'
    },{
      id:'id4',
      contenido:'español',
      tipo: 'Asistente',
      fechaEnvio: new Date(ahora.getTime()),
      estado: 'Enviado',
      usuarioId: 'a1'
    },{
      id:'id5',
      contenido:'Dime los numeros del 1 al 10',
      tipo: 'Usuario',
      fechaEnvio: new Date(ahora.getTime()),
      estado: 'Enviado',
      usuarioId: 'u1'
    },{
      id:'id6',
      contenido:'1, 2, 3, 4, 5, 6, 7, 8, 9, 10',
      tipo: 'Asistente',
      fechaEnvio: new Date(ahora.getTime()),
      estado: 'Enviado',
      usuarioId: 'a1'
    },
    {
      id:'id7',
      contenido:'Hola eres el asistente?',
      tipo: 'Usuario',
      fechaEnvio: new Date(ahora.getTime()),
      estado: 'Enviado',
      usuarioId: 'u1'
    },{
      id:'id8',
      contenido:'Hola soy tu asistente',
      tipo: 'Asistente',
      fechaEnvio: new Date(ahora.getTime()),
      estado: 'Enviado',
      usuarioId: 'a1'
    },
    {
      id:'id9',
      contenido:'Dime una palabra aleatoria',
      tipo: 'Usuario',
      fechaEnvio: new Date(ahora.getTime()),
      estado: 'Enviado',
      usuarioId: 'u1'
    },{
      id:'id10',
      contenido:'español',
      tipo: 'Asistente',
      fechaEnvio: new Date(ahora.getTime()),
      estado: 'Enviado',
      usuarioId: 'a1'
    },{
      id:'id11',
      contenido:'Dime los numeros del 1 al 10',
      tipo: 'Usuario',
      fechaEnvio: new Date(ahora.getTime()),
      estado: 'Enviado',
      usuarioId: 'u1'
    },{
      id:'id12',
      contenido:'1, 2, 3, 4, 5, 6, 7, 8, 9, 10',
      tipo: 'Asistente',
      fechaEnvio: new Date(ahora.getTime()),
      estado: 'Enviado',
      usuarioId: 'a1'
    }
  ]
  }
}


