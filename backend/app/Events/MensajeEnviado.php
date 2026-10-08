<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MensajeEnviado implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $mensaje;

    /**
     * Create a new event instance.
     */
    public function __construct($mensaje)
    {
        $this->mensaje = $mensaje;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [];

        // Identificador canónico de conversación entre dos usuarios: min_max
        $remitente = (int) ($this->mensaje->id_remitente ?? 0);
        $destinatario = (int) ($this->mensaje->id_destinatario ?? 0);

        if ($remitente > 0 && $destinatario > 0) {
            $convId = min($remitente, $destinatario) . '_' . max($remitente, $destinatario);
            $channels[] = new PrivateChannel('chat.' . $convId);
        }

        if (!empty($this->mensaje->id_conversacion)) {
            $channels[] = new PrivateChannel('chat.' . $this->mensaje->id_conversacion);
        }

        // Canales privados directos para notificaciones/chats individuales
        if ($destinatario > 0) {
            $channels[] = new PrivateChannel('chat.' . $destinatario);
            $channels[] = new PrivateChannel('user.' . $destinatario);
        }

        if ($remitente > 0) {
            $channels[] = new PrivateChannel('chat.' . $remitente);
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'nuevo.mensaje';
    }

    /**
     * Data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'mensaje' => $this->mensaje,
        ];
    }
}
