<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Fotografia extends Model
{
    protected $table = 'fotografias';
    protected $primaryKey = 'id_foto';

    protected $fillable = ['id_inmueble', 'url', 'orden', 'es_portada'];

    protected $casts = [
        'es_portada' => 'boolean',
    ];

    public function inmueble()
    {
        return $this->belongsTo(Inmueble::class, 'id_inmueble', 'id_inmueble');
    }
}
