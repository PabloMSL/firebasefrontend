import { Injectable, inject} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';


interface  PeticionGemini{
  contents: ContentGemini[];
  generationConfig?:{
    maxOutputTokens?: number;
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

    const contenido: ContentGemini[] = [
      mensajeSistema,
      respuestaSistema,
      // traer el historial previo
      ...historialPrevio,
      {
        role:'user',
        parts:[{text:mensaje}]
      }
    ];

    const configuracionesSeguridad: SafetySettings[]=[
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ];

    const cuerpoPeticion: PeticionGemini={
      contents: contenido,
      generationConfig:{
        maxOutputTokens:800,
        temperature: 0.7
      },
      safetySettings: configuracionesSeguridad
    };

    // Vamos a generar la url completa
    const urlCompleta = `${this.apiUrl}?key=${this.apiKey}`

    //hacer la peticion a http de conectarnos a la api de gemini
    return this.http.post<RespuestaGemini>(urlCompleta, cuerpoPeticion, {headers})
    .pipe(
      map( respuesta => {
        //Vamos a revisar que la respuesta tenga un formato correcto
        if(respuesta.candidate && respuesta.candidate.length>0){
          const candidate = respuesta.candidate[0];
          if(candidate.content && candidate.content.parts && candidate.content.parts.length>0){
            let contenidoRespuesta = candidate.content.parts[0].text;

            //validacion por si la respuesta es erronea por limites de tokens
            if(candidate.finishReason === "MAX_TOKENS"){
              contenidoRespuesta += "\n\n[nota: Respuesta truncada por limite de tokens, puedes pedrime que continue de nuevo]"
            }
            return contenidoRespuesta
          }else{
            throw new Error("Respuesta no contiene un formato valido")
          }
        }else{
          throw new Error('Respuesta no contiene un formato esperado')
        }
      }),
      catchError(error =>{
        console.log("Error al comunicarse con gemini")
        let mensajeError = 'Error al conectarse con gemini'

        if(error.status === 400){
          mensajeError = 'Error peticion invalida a gemini, verifique la configuracion'
        }else if(error.status === 403){
          mensajeError = 'Error clave de api no valida o sin permisos'
        }else if(error.status === 429){
          mensajeError = 'Has excedido el limite de peticiones a gemini, intenta mas tarde'
        }else if(error.status === 500){
          mensajeError = 'Error con el servidor de gemini'
        }
        return throwError(()=> new Error(mensajeError));
      })
    )

  }


  // funcion para convertir el formato de gemini

  convertirHistorialGemini(mensaje: any[]): ContentGemini[]{
    const HistorialConvertido: ContentGemini[] = mensaje.map(msg => (
      {
      role: (msg.tipo === 'Usuario' ? 'user' : 'model') as 'user' | 'model', 
      parts:[{text: msg.contenido}]
      }
    ));
    if(HistorialConvertido.length>8){
      const ultimosMensajes = HistorialConvertido.slice(-8)
      if (ultimosMensajes.length>0 && ultimosMensajes[0].role==='model'){
        return ultimosMensajes.slice(1);
      }
      return ultimosMensajes
    }
    return HistorialConvertido;
  }


  verificarConfiguracion(): boolean{
    const configuracionValida = !!(this.apiKey && this.apiKey !==
      "Tu_api_key_de_gemini" && this.apiUrl);
      return configuracionValida
  }
}
