<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ArrendadorRechazadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $observacion;

    public function __construct(User $user, string $observacion)
    {
        $this->user = $user;
        $this->observacion = $observacion;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Revisión de Documentación - ULEAM Rental',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.arrendadores.rechazado',
            with: [
                'user'        => $this->user,
                'observacion' => $this->observacion,
            ],
        );
    }
}
