<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ubicacion extends Model
{
    use HasFactory;
    protected $table = 'ubicaciones';
    protected $primaryKey = 'id_ubicacion';

    protected $fillable = [
        'id_inmueble', 'latitud', 'longitud', 'direccion_referencial',
        'sector', 'distancia_uleam_km',
    ];

    protected $casts = [
        'latitud' => 'decimal:7',
        'longitud' => 'decimal:7',
        'distancia_uleam_km' => 'decimal:2',
    ];

    public function inmueble()
    {
        return $this->belongsTo(Inmueble::class, 'id_inmueble', 'id_inmueble');
    }
}
