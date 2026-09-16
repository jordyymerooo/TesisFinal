<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SolicitudReserva extends Model
{
    protected $table = 'solicitudes_reserva';
    protected $primaryKey = 'id_solicitud';

    protected $fillable = [
        'id_estudiante', 'id_inmueble', 'estado',
        'fecha_deseada_ingreso', 'mensaje_inicial',
    ];

    protected $casts = [
        'fecha_deseada_ingreso' => 'date',
    ];

    public function estudiante()
    {
        return $this->belongsTo(User::class, 'id_estudiante', 'id_usuario');
    }

    public function inmueble()
    {
        return $this->belongsTo(Inmueble::class, 'id_inmueble', 'id_inmueble');
    }
}
