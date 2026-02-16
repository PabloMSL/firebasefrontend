import { Component } from '@angular/core';
import { MensajeChat } from '../../../models/chat';

@Component({
  selector: 'app-chat',
  imports: [],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  nombre:string="Santiago Beltran"
  email:string="santiago@gmail.com"
  manejoErrorImagen(){
    console.log('Error al cargar la imagen del usuario');
  }
  mensajes: MensajeChat[] = []
  cargandoHistorial = 1
  cerrarSesion(){}
}
