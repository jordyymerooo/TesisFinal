<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Perfil extends Model
{
    protected $table = 'perfiles';
    protected $primaryKey = 'id_perfil';

    protected $fillable = [
        'id_usuario', 'identificacion', 'telefono', 'foto_perfil_url', 'ciudad_origen',
        'documento_verificado', 'documento_tipo', 'documento_url',
        'documento_posterior_url', 'recibo_luz_url',
    ];

    protected $casts = [
        'documento_verificado' => 'boolean',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario', 'id_usuario');
    }
}
