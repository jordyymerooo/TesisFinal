<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comunicado extends Model
{
    protected $table = 'comunicados';
    protected $primaryKey = 'id_comunicado';

    protected $fillable = [
        'titulo',
        'mensaje',
        'destinatarios',
        'usuarios_ids',
        'id_admin',
    ];

    protected $casts = [
        'usuarios_ids' => 'array',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'id_admin', 'id_usuario');
    }
}
