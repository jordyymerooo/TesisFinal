<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitudes_reserva', function (Blueprint $table) {
            $table->id('id_solicitud');
            $table->foreignId('id_estudiante')->constrained('users', 'id_usuario')->cascadeOnDelete();
            $table->foreignId('id_inmueble')->constrained('inmuebles', 'id_inmueble')->cascadeOnDelete();
            $table->enum('estado', ['pendiente', 'aceptada', 'rechazada', 'cancelada'])->default('pendiente');
            $table->date('fecha_deseada_ingreso')->nullable();
            $table->text('mensaje_inicial')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitudes_reserva');
    }
};
