<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistroAuditoria extends Model
{
    protected $table = 'registro_auditoria';
    protected $primaryKey = 'id_auditoria';

    protected $fillable = [
        'id_administrador', 'accion', 'entidad', 'id_entidad', 'detalle', 'fecha',
    ];

    protected $casts = [
        'fecha' => 'datetime',
    ];

    public function administrador()
    {
        return $this->belongsTo(User::class, 'id_administrador', 'id_usuario');
    }
}
