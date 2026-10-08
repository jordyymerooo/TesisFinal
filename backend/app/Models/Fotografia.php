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

    protected $appends = ['id'];

    public function getIdAttribute()
    {
        return $this->id_foto;
    }

    /**
     * Garantiza que la URL devuelta siempre sea absoluta.
     * Si el valor guardado ya empieza con http(s)://, lo retorna tal cual.
     * Si no, asume que es un path relativo de storage/ y construye la URL.
     */
    public function getUrlAttribute($value): string
    {
        if (!$value) return '';
        // Si contiene /storage/ con cualquier host previo (ej: IP anterior o localhost), resolver con la IP actual
        if (preg_match('#https?://[^/]+/storage/(.*)#', $value, $matches)) {
            return asset('storage/' . ltrim($matches[1], '/'));
        }
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }
        // path relativo tipo "inmuebles/foto.jpg" o "storage/inmuebles/foto.jpg"
        $cleanPath = ltrim(str_replace('storage/', '', $value), '/');
        return asset('storage/' . $cleanPath);
    }

    public function inmueble()
    {
        return $this->belongsTo(Inmueble::class, 'id_inmueble', 'id_inmueble');
    }
}
