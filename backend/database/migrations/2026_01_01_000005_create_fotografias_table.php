<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fotografias', function (Blueprint $table) {
            $table->id('id_foto');
            $table->foreignId('id_inmueble')->constrained('inmuebles', 'id_inmueble')->cascadeOnDelete();
            $table->string('url');
            $table->unsignedTinyInteger('orden')->default(0);
            $table->boolean('es_portada')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fotografias');
    }
};
