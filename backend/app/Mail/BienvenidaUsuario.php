<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BienvenidaUsuario extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Crea una nueva instancia del correo de bienvenida.
     *
     * @param  \App\Models\User  $usuario  Usuario recién registrado
     */
    public function __construct(public User $usuario)
    {
        //
    }

    /**
     * Define el asunto y remitente del correo.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '¡Bienvenido a ULEAM Alojamiento Estudiantil!',
        );
    }

    /**
     * Define la vista markdown que renderiza el cuerpo del correo.
     * La propiedad pública $usuario queda disponible automáticamente en la vista.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.bienvenida',
            with: [
                'usuario'  => $this->usuario,
                'rol'      => (int) $this->usuario->id_rol === 2 ? 'arrendador' : 'estudiante',
                'appUrl'   => config('app.url'),
            ],
        );
    }

    /**
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
