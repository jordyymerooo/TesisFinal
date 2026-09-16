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
        Schema::create('favoritos', function (Blueprint $table) {
            $table->id('id_favorito');
            $table->foreignId('id_usuario')->constrained('users', 'id_usuario')->cascadeOnDelete();
            $table->foreignId('id_inmueble')->constrained('inmuebles', 'id_inmueble')->cascadeOnDelete();
            $table->unique(['id_usuario', 'id_inmueble']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('favoritos');
    }
};
