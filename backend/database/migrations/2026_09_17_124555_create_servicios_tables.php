<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('servicios')) {
            Schema::create('servicios', function (Blueprint $table) {
                $table->id('id_servicio');
                $table->string('clave', 50)->unique();
                $table->string('nombre', 100);
                $table->string('icono', 50)->nullable();
                $table->timestamps();
            });

            // Sembrar servicios predefinidos de la red ULEAM
            DB::table('servicios')->insert([
                ['clave' => 'agua',         'nombre' => 'Agua Potable',          'icono' => 'droplets', 'created_at' => now(), 'updated_at' => now()],
                ['clave' => 'luz',          'nombre' => 'Energía Eléctrica',     'icono' => 'zap',      'created_at' => now(), 'updated_at' => now()],
                ['clave' => 'internet',     'nombre' => 'Internet Fibra Óptica', 'icono' => 'wifi',     'created_at' => now(), 'updated_at' => now()],
                ['clave' => 'amoblado',     'nombre' => 'Amoblado Completo',     'icono' => 'home',     'created_at' => now(), 'updated_at' => now()],
                ['clave' => 'bano_privado', 'nombre' => 'Baño Privado',          'icono' => 'sparkles', 'created_at' => now(), 'updated_at' => now()],
                ['clave' => 'ac',           'nombre' => 'Aire Acondicionado',    'icono' => 'wind',     'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        if (!Schema::hasTable('inmueble_servicio')) {
            Schema::create('inmueble_servicio', function (Blueprint $table) {
                $table->foreignId('id_inmueble')->constrained('inmuebles', 'id_inmueble')->cascadeOnDelete();
                $table->foreignId('id_servicio')->constrained('servicios', 'id_servicio')->cascadeOnDelete();
                $table->primary(['id_inmueble', 'id_servicio']);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inmueble_servicio');
        Schema::dropIfExists('servicios');
    }
};
