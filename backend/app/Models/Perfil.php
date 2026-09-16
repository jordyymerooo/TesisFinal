<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Perfil extends Model
{
    protected $table = 'perfiles';
    protected $primaryKey = 'id_perfil';

    protected $fillable = [
        'id_usuario', 'telefono', 'foto_perfil_url', 'ciudad_origen',
        'documento_verificado', 'documento_tipo', 'documento_url',
    ];

    protected $casts = [
        'documento_verificado' => 'boolean',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario', 'id_usuario');
    }
}
