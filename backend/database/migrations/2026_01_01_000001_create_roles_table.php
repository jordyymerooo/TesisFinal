<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id('id_rol');
            $table->string('nombre', 50)->unique(); // estudiante, arrendador, administrador
            $table->timestamps();
        });

        DB::table('roles')->insert([
            ['id_rol' => 1, 'nombre' => 'estudiante', 'created_at' => now(), 'updated_at' => now()],
            ['id_rol' => 2, 'nombre' => 'arrendador', 'created_at' => now(), 'updated_at' => now()],
            ['id_rol' => 3, 'nombre' => 'administrador', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
