<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$admin = User::where('correo', 'admin@uleam.edu.ec')
             ->orWhere('correo', 'admin@uleam.rental')
             ->first();
if($admin) {
    $admin->correo = 'admin@uleam.rental';
    $admin->password = Hash::make('Uleam2026!');
    $admin->save();
    echo "Admin updated\n";
} else {
    echo "Admin not found\n";
}
