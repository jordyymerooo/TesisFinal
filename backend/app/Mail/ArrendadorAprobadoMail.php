<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ArrendadorAprobadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $usuario;

    public function __construct(User $usuario)
    {
        $this->usuario = $usuario;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '¡Tu cuenta de Arrendador ha sido aprobada! - ULEAM Rental',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.arrendador_aprobado',
            with: [
                'usuario' => $this->usuario,
            ],
        );
    }
}
