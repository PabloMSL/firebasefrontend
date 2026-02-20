export interface MensajeChat{
    id: String,
    contenido: String,
    usuarioId: String,
    fechaEnvio: Date,
    estado: 'Enviado' | 'Enviando' | 'Error' | 'Temporal'
    tipo: 'Usuario' | 'Asistente'
}

export interface ConversacionChat{
    id: String,
    usuarioId: String,
    mensajes: MensajeChat,
    ultimaActividad: Date,
    fechaCreacion: Date,
    titulo: String,
}