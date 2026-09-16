<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inmuebles', function (Blueprint $table) {
            $table->id('id_inmueble');
            $table->foreignId('id_arrendador')->constrained('users', 'id_usuario')->cascadeOnDelete();
            $table->string('titulo', 150);
            $table->text('descripcion')->nullable();
            $table->decimal('precio', 8, 2);
            $table->enum('tipo', ['cuarto', 'mini_departamento', 'departamento_compartido', 'suite'])->default('cuarto');
            $table->enum('estado', ['borrador', 'publicado', 'reservado', 'inactivo'])->default('borrador');
            $table->unsignedTinyInteger('capacidad')->nullable();
            $table->boolean('servicios_incluidos')->default(false);
            $table->decimal('calificacion_promedio', 3, 1)->default(0.0)->comment('Promedio de calificaciones 0-5');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inmuebles');
    }
};
