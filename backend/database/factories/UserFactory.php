<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<User>
 *
 * Corrección: usa los campos reales del modelo (nombres, correo, clave_hash, id_rol, estado)
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    protected static ?string $password = null;

    public function definition(): array
    {
        return [
            'id_rol'     => 1, // estudiante por defecto
            'nombres'    => $this->faker->name(),
            'correo'     => $this->faker->unique()->safeEmail(),
            'clave_hash' => static::$password ??= Hash::make('password'),
            'estado'     => 'activo',
        ];
    }

    /** Estado: estudiante (id_rol = 1) */
    public function estudiante(): static
    {
        return $this->state(['id_rol' => 1]);
    }

    /** Estado: arrendador (id_rol = 2) */
    public function arrendador(): static
    {
        return $this->state(['id_rol' => 2]);
    }

    /** Estado: administrador (id_rol = 3) */
    public function administrador(): static
    {
        return $this->state(['id_rol' => 3]);
    }

    /** Estado: pendiente de verificación */
    public function pendiente(): static
    {
        return $this->state(['estado' => 'pendiente']);
    }
}
