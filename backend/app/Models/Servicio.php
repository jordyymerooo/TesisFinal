<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Servicio extends Model
{
    use HasFactory;

    protected $table = 'servicios';
    protected $primaryKey = 'id_servicio';

    protected $fillable = [
        'clave',
        'nombre',
        'icono',
    ];

    public function inmuebles()
    {
        return $this->belongsToMany(Inmueble::class, 'inmueble_servicio', 'id_servicio', 'id_inmueble')
            ->withTimestamps();
    }
}
