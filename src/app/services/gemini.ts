import { Injectable, inject} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';


interface  PeticionGemini{
  contents: ContentGemini[];
  generationConfig?:{
    maxOuputTonkens?: number;
    temperature?: number
  }
  safetySettings: SafetySettings[];
}

interface ContentGemini{
  role: 'user' | 'model';
  parts: PartGemini[];

}

interface PartGemini{
  text: string;
}

interface SafetySettings{
  category: string;
  threshold: string;
}

interface RespuestaGemini{
  candidate:{
    content:{
      parts:{
        text: string;
      }[];
    };
    finishReason: string;
  }[];
  usageMetaData?:{
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: Number;
  };
}



@Injectable({
  providedIn: "root"
})
export class GeminiService {
  //inyecciones de dependencias
  private http  = inject(HttpClient)

  // variables que llevan la url

  private apiUrl = environment.gemini.apiUrl
  private apiKey = environment.gemini.apiKey

  enviarMensaje(mensaje: string, historialPrevio: ContentGemini[]=[]): Observable<string>{
    // verificar si la url esta bien configurada
    if(!this.apiKey || this.apiKey ==='Tu_apiKey_de_Gemini'){
      console.error('Error la api key no esta configurada')
      return throwError(()=> new Error('Api de gemini no configurada corectamente'))
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })

  
    const mensajeSistema: ContentGemini={
      role: 'user',
      parts:[{
        text: "Eres un asistente virtual util y amigable, responde siempre en español de manera concisa. Eres especialista en preguntas generales y sobretodo en programacion de software. Manten un tono profesional pero cercano"
      }]
    }

    const respuestaSistema:ContentGemini={
      role: 'model',
      parts:[{
        text: 'Entendido, soy tu asistente virtual, especializado en programacion de software, te contestare en español ¿En que puedo ayudarte?'
      }]
    }
    //vamos a enviar un mensaje al contenido del sistema
  }
}
