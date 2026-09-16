<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mensajes', function (Blueprint $table) {
            $table->id('id_mensaje');
            $table->foreignId('id_remitente')->constrained('users', 'id_usuario')->cascadeOnDelete();
            $table->foreignId('id_destinatario')->constrained('users', 'id_usuario')->cascadeOnDelete();
            $table->foreignId('id_inmueble')->constrained('inmuebles', 'id_inmueble')->cascadeOnDelete();
            $table->text('contenido');
            $table->boolean('leido')->default(false);
            $table->timestamp('fecha')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mensajes');
    }
};
