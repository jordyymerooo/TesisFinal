<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    use HasFactory;

    protected $table = 'notificaciones';
    protected $primaryKey = 'id_notificacion';

    protected $fillable = [
        'id_usuario',
        'user_id',
        'titulo',
        'mensaje',
        'tipo',
        'datos',
        'leido',
        'leido_en',
    ];

    protected $casts = [
        'datos'    => 'array',
        'leido'    => 'boolean',
        'leido_en' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            if (empty($model->id_usuario) && !empty($model->user_id)) {
                $model->id_usuario = $model->user_id;
            } elseif (empty($model->user_id) && !empty($model->id_usuario)) {
                $model->user_id = $model->id_usuario;
            }
        });
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario', 'id_usuario');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id_usuario');
    }
}
