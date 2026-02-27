import { Injectable, inject } from '@angular/core';
import { Firestore, collection } from '@angular/fire/firestore';
import { MensajeChat } from '../../models/chat';
import { addDoc, Timestamp } from 'firebase/firestore';
import { __awaiter } from 'tslib';
import { interval } from 'rxjs';

@Injectable({
  providedIn: "root"
})
export class FirebaseService {
  private firestore = inject(Firestore)


  // Funcion para guardar el mensaje
  async guardarMensaje(mensaje: MensajeChat): Promise<void>{
    try{
      // Revisar si viene sin usuarioID
      if(!mensaje.usuarioId){
        // devuelvo que el mensaje debe tener un usuarioId
        throw new Error('Usuario Id es requerido');
      } else if(!mensaje.contenido){
        throw new Error('El contenido es requerido');
      } else if(!mensaje.tipo){
        throw new Error('El tipo es requerido');
      }


      const coleccionMensajes = collection(this.firestore, 'Mensajes')

      //Preparar el mensaje respecto a las fechas
      const mensajeGuardar={
        usuarioId : mensaje.usuarioId,
        contenido : mensaje.contenido,
        tipo: mensaje.tipo,
        estado: mensaje.estado,
        //fecha es de tipo TIMESTAMP y necesito pasarla a date
        fechaEnvio: Timestamp.fromDate(mensaje.fechaEnvio)
      };

      const docRef = await addDoc(coleccionMensajes, mensajeGuardar)
    }catch(error: any){
      console.error(' Error al guardar el mensaje en firestore')
      console.error('Error details', {
        mensaje: error.message,
        code : error.code,
        stack: error.stack
      })
    }

    obtenerMensajesusuario(userId: int): observable${

      // filtrar mensajes por usuario
    }
  }
}

