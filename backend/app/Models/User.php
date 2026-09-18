<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, Notifiable;

    protected $primaryKey = 'id_usuario';

    protected $fillable = [
        'id_rol', 'nombres', 'correo', 'clave_hash', 'estado', 'email_verified_at',
    ];

    protected $hidden = [
        'clave_hash', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function getAuthPassword()
    {
        return $this->clave_hash;
    }

    /**
     * Devuelve el correo electrónico utilizado para la verificación de cuenta.
     */
    public function getEmailForVerification()
    {
        return $this->correo;
    }

    /**
     * Enruta las notificaciones por correo (VerifyEmail) hacia la columna correo.
     */
    public function routeNotificationForMail($notification = null)
    {
        return $this->correo;
    }

    public function rol()
    {
        return $this->belongsTo(Rol::class, 'id_rol', 'id_rol');
    }

    public function perfil()
    {
        return $this->hasOne(Perfil::class, 'id_usuario', 'id_usuario');
    }

    public function inmuebles()
    {
        return $this->hasMany(Inmueble::class, 'id_arrendador', 'id_usuario');
    }

    public function solicitudesReserva()
    {
        return $this->hasMany(SolicitudReserva::class, 'id_estudiante', 'id_usuario');
    }

    public function mensajesEnviados()
    {
        return $this->hasMany(Mensaje::class, 'id_remitente', 'id_usuario');
    }

    public function mensajesRecibidos()
    {
        return $this->hasMany(Mensaje::class, 'id_destinatario', 'id_usuario');
    }

    public function verificacionesRealizadas()
    {
        return $this->hasMany(Verificacion::class, 'id_admin', 'id_usuario');
    }

    public function auditorias()
    {
        return $this->hasMany(RegistroAuditoria::class, 'id_administrador', 'id_usuario');
    }

    public function esEstudiante(): bool
    {
        return $this->id_rol === 1;
    }

    public function esArrendador(): bool
    {
        return $this->id_rol === 2;
    }

    public function esAdministrador(): bool
    {
        return $this->id_rol === 3;
    }

    public function favoritos()
    {
        return $this->belongsToMany(Inmueble::class, 'favoritos', 'id_usuario', 'id_inmueble')->withTimestamps();
    }

    public function notificaciones()
    {
        return $this->hasMany(Notificacion::class, 'id_usuario', 'id_usuario');
    }
}
