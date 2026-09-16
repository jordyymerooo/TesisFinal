<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('verificaciones', function (Blueprint $table) {
            $table->id('id_verificacion');
            $table->foreignId('id_admin')->constrained('users', 'id_usuario')->restrictOnDelete();
            $table->foreignId('id_inmueble')->nullable()->constrained('inmuebles', 'id_inmueble')->cascadeOnDelete();
            $table->foreignId('id_usuario_verificado')->nullable()->constrained('users', 'id_usuario')->cascadeOnDelete();
            $table->enum('estado', ['pendiente', 'aprobado', 'rechazado'])->default('pendiente');
            $table->text('observaciones')->nullable();
            $table->timestamp('fecha_revision')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verificaciones');
    }
};
