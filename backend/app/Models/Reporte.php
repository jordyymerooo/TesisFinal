<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reporte extends Model
{
    use HasFactory;

    protected $table = 'reportes';

    protected $fillable = [
        'estudiante_id',
        'arrendador_id',
        'inmueble_id',
        'motivo',
        'descripcion',
        'estado',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Estudiante que emite el reporte / denuncia.
     */
    public function estudiante()
    {
        return $this->belongsTo(User::class, 'estudiante_id', 'id_usuario');
    }

    /**
     * Arrendador reportado.
     */
    public function arrendador()
    {
        return $this->belongsTo(User::class, 'arrendador_id', 'id_usuario');
    }

    /**
     * Inmueble reportado (opcional).
     */
    public function inmueble()
    {
        return $this->belongsTo(Inmueble::class, 'inmueble_id', 'id_inmueble');
    }
}
