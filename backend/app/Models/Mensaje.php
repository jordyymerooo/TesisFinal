<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mensaje extends Model
{
    protected $table = 'mensajes';
    protected $primaryKey = 'id_mensaje';

    protected $fillable = [
        'id_remitente', 'id_destinatario', 'id_inmueble',
        'contenido', 'leido', 'fecha',
    ];

    protected $casts = [
        'leido' => 'boolean',
        'fecha' => 'datetime',
    ];

    public function remitente()
    {
        return $this->belongsTo(User::class, 'id_remitente', 'id_usuario');
    }

    public function destinatario()
    {
        return $this->belongsTo(User::class, 'id_destinatario', 'id_usuario');
    }

    public function inmueble()
    {
        return $this->belongsTo(Inmueble::class, 'id_inmueble', 'id_inmueble');
    }
}
