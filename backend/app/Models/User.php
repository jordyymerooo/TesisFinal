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
        'id_rol', 'nombres', 'correo', 'foto_perfil', 'clave_hash', 'password', 'estado', 'email_verified_at',
        'estado_kyc', 'kyc_observacion', 'kyc_intentos', 'expo_push_token', 'telefono', 'cedula', 'identificacion', 'verified_by', 'verified_at',
    ];

    protected $hidden = [
        'clave_hash', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'verified_at' => 'datetime',
        'kyc_intentos' => 'integer',
    ];

    public function verifiedByAdmin()
    {
        return $this->belongsTo(User::class, 'verified_by', 'id_usuario');
    }

    protected $appends = [
        'estado_kyc',
        'nombre_completo',
        'email',
        'cedula',
        'identificacion',
        'foto_url',
        'foto_perfil_url',
    ];

    public function getCedulaAttribute(): ?string
    {
        $perfil = $this->relationLoaded('perfil') ? $this->perfil : $this->perfil()->first();
        return $perfil?->identificacion;
    }

    public function getIdentificacionAttribute(): ?string
    {
        return $this->getCedulaAttribute();
    }

    public function getTelefonoAttribute($value): ?string
    {
        if (!empty($value)) {
            return $value;
        }
        $perfil = $this->relationLoaded('perfil') ? $this->perfil : $this->perfil()->first();
        return $perfil?->telefono;
    }

    /**
     * Calcula dinámicamente el estado KYC para arrendadores o retorna el valor persistido.
     * Retorna: 'aprobado' | 'en_revision' | 'rechazado' | 'pendiente_documentos' | null
     */
    public function getEstadoKycAttribute($value = null)
    {
        if ((int) $this->id_rol !== 2) {
            return null;
        }
        $val = $value ?: ($this->attributes['estado_kyc'] ?? null);
        if (!empty($val)) {
            return $val;
        }
        $perfil = $this->relationLoaded('perfil') ? $this->perfil : $this->perfil()->first();
        if ($perfil && $perfil->documento_verificado) {
            return 'aprobado';
        }
        if ($perfil && (!empty($perfil->documento_url) || $perfil->documento_tipo === 'cedula')) {
            return 'en_revision';
        }
        return 'pendiente_documentos';
    }

    public function getNombreCompletoAttribute(): string
    {
        return $this->nombres ?? '';
    }

    public function getEmailAttribute(): string
    {
        return $this->correo ?? '';
    }

    public function getFotoUrlAttribute(): ?string
    {
        if ($this->foto_perfil) {
            if (preg_match('#https?://[^/]+/storage/(.*)#', $this->foto_perfil, $matches)) {
                return asset('storage/' . ltrim($matches[1], '/'));
            }
            if (str_starts_with($this->foto_perfil, 'http://') || str_starts_with($this->foto_perfil, 'https://')) {
                return $this->foto_perfil;
            }
            $cleaned = ltrim(str_replace('storage/', '', $this->foto_perfil), '/');
            return asset('storage/' . $cleaned);
        }
        $perfil = $this->relationLoaded('perfil') ? $this->perfil : $this->perfil()->first();
        if ($perfil && $perfil->foto_perfil_url) {
            $url = $perfil->foto_perfil_url;
            if (preg_match('#https?://[^/]+/storage/(.*)#', $url, $matches)) {
                return asset('storage/' . ltrim($matches[1], '/'));
            }
            if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
                return $url;
            }
            $cleaned = ltrim(str_replace('storage/', '', $url), '/');
            return asset('storage/' . $cleaned);
        }
        return null;
    }

    public function getFotoPerfilUrlAttribute(): ?string
    {
        return $this->getFotoUrlAttribute();
    }

    public function getAuthPassword()
    {
        return $this->clave_hash;
    }

    public function setPasswordAttribute($value)
    {
        $this->attributes['clave_hash'] = (is_string($value) && (str_starts_with($value, '$2y$') || str_starts_with($value, '$2a$')))
            ? $value
            : \Illuminate\Support\Facades\Hash::make($value);
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
