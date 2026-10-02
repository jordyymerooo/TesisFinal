<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAuditLog extends Model
{
    protected $fillable = ['admin_id', 'action', 'target_user_name', 'details'];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id', 'id_usuario');
    }
}
