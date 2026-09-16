<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Verificacion extends Model
{
    protected $table = 'verificaciones';
    protected $primaryKey = 'id_verificacion';

    protected $fillable = [
        'id_admin', 'id_inmueble', 'id_usuario_verificado',
        'estado', 'observaciones', 'fecha_revision',
    ];

    protected $casts = [
        'fecha_revision' => 'datetime',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'id_admin', 'id_usuario');
    }

    public function inmueble()
    {
        return $this->belongsTo(Inmueble::class, 'id_inmueble', 'id_inmueble');
    }

    public function usuarioVerificado()
    {
        return $this->belongsTo(User::class, 'id_usuario_verificado', 'id_usuario');
    }
}
