<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('perfiles', function (Blueprint $table) {
            $table->id('id_perfil');
            $table->foreignId('id_usuario')->unique()->constrained('users', 'id_usuario')->cascadeOnDelete();
            $table->string('telefono', 20)->nullable();
            $table->string('foto_perfil_url')->nullable();
            $table->string('ciudad_origen', 100)->nullable();
            $table->boolean('documento_verificado')->default(false);
            $table->string('documento_tipo', 30)->nullable();
            $table->string('documento_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('perfiles');
    }
};
