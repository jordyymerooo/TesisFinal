<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['correo' => 'admin@uleam.rental'],
            [
                'id_rol' => 3,
                'nombres' => 'Administrador Sistema',
                'clave_hash' => Hash::make('password123'), // Contraseña original del sistema
                'estado' => 'activo',
                'email_verified_at' => now()
            ]
        );
    }
}
