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
        Schema::create('kyc_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_arrendador');
            $table->unsignedBigInteger('id_admin');
            $table->string('accion'); // 'aprobado' o 'rechazado'
            $table->text('observaciones')->nullable();
            $table->string('arrendador_nombre')->nullable();
            $table->string('arrendador_cedula')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kyc_histories');
    }
};
