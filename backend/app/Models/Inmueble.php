<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inmueble extends Model
{
    use HasFactory;
    protected $table = 'inmuebles';
    protected $primaryKey = 'id_inmueble';

    protected $fillable = [
        'id_arrendador', 'titulo', 'descripcion', 'precio', 'tipo',
        'estado', 'capacidad', 'servicios_incluidos', 'calificacion_promedio',
        'normas',
    ];

    protected $appends = ['precio_mensual'];

    protected $casts = [
        'precio' => 'decimal:2',
        'precio_mensual' => 'decimal:2',
        'servicios_incluidos' => 'boolean',
    ];

    public function getPrecioMensualAttribute()
    {
        return $this->precio;
    }

    public function arrendador()
    {
        return $this->belongsTo(User::class, 'id_arrendador', 'id_usuario');
    }

    public function fotografias()
    {
        return $this->hasMany(Fotografia::class, 'id_inmueble', 'id_inmueble');
    }

    public function ubicacion()
    {
        return $this->hasOne(Ubicacion::class, 'id_inmueble', 'id_inmueble');
    }

    public function verificaciones()
    {
        return $this->hasMany(Verificacion::class, 'id_inmueble', 'id_inmueble');
    }

    public function solicitudesReserva()
    {
        return $this->hasMany(SolicitudReserva::class, 'id_inmueble', 'id_inmueble');
    }

    public function mensajes()
    {
        return $this->hasMany(Mensaje::class, 'id_inmueble', 'id_inmueble');
    }

    public function usuariosFavoritos()
    {
        return $this->belongsToMany(User::class, 'favoritos', 'id_inmueble', 'id_usuario')->withTimestamps();
    }

    public function servicios()
    {
        return $this->belongsToMany(Servicio::class, 'inmueble_servicio', 'id_inmueble', 'id_servicio')->withTimestamps();
    }
}
