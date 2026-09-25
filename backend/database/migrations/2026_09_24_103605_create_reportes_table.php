<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reportes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estudiante_id')->constrained('users', 'id_usuario')->cascadeOnDelete();
            $table->foreignId('arrendador_id')->constrained('users', 'id_usuario')->cascadeOnDelete();
            $table->foreignId('inmueble_id')->nullable()->constrained('inmuebles', 'id_inmueble')->nullOnDelete();
            $table->string('motivo'); // ej: 'fraude', 'informacion_falsa', 'inapropiado'
            $table->text('descripcion')->nullable();
            $table->enum('estado', ['pendiente', 'resuelto', 'descartado'])->default('pendiente');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reportes');
    }
};
