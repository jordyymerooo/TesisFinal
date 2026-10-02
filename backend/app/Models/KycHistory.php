<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KycHistory extends Model
{
    protected $table = 'kyc_histories';

    protected $fillable = [
        'id_arrendador',
        'id_admin',
        'accion',
        'observaciones',
        'arrendador_nombre',
        'arrendador_cedula',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Arrendador asociado a la verificación
     */
    public function arrendador()
    {
        return $this->belongsTo(User::class, 'id_arrendador', 'id_usuario');
    }

    /**
     * Administrador que realizó la aprobación o rechazo
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'id_admin', 'id_usuario');
    }
}
