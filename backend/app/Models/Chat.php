<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    protected $table = 'chats';

    protected $fillable = [
        'id_estudiante',
        'id_arrendador',
        'id_inmueble',
        'ultimo_mensaje_texto',
        'ultimo_mensaje_at',
    ];

    protected $casts = [
        'ultimo_mensaje_at' => 'datetime',
    ];

    public function estudiante()
    {
        return $this->belongsTo(User::class, 'id_estudiante', 'id_usuario');
    }

    public function arrendador()
    {
        return $this->belongsTo(User::class, 'id_arrendador', 'id_usuario');
    }

    public function inmueble()
    {
        return $this->belongsTo(Inmueble::class, 'id_inmueble', 'id_inmueble');
    }

    public function getMensajesAttribute()
    {
        return Mensaje::where(function ($q) {
            $q->where('id_remitente', $this->id_estudiante)
              ->where('id_destinatario', $this->id_arrendador);
        })->orWhere(function ($q) {
            $q->where('id_remitente', $this->id_arrendador)
              ->where('id_destinatario', $this->id_estudiante);
        })
        ->orderBy('created_at', 'asc')
        ->get();
    }
}
