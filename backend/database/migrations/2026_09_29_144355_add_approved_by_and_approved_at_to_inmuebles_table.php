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
        Schema::table('inmuebles', function (Blueprint $table) {
            // ID del admin que aprobó la propiedad (nullable, FK a users.id_usuario)
            $table->unsignedBigInteger('aprobado_por')->nullable()->after('estado');
            $table->foreign('aprobado_por')->references('id_usuario')->on('users')->nullOnDelete();
            // Fecha/hora exacta de aprobación
            $table->timestamp('aprobado_en')->nullable()->after('aprobado_por');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inmuebles', function (Blueprint $table) {
            $table->dropForeign(['aprobado_por']);
            $table->dropColumn(['aprobado_por', 'aprobado_en']);
        });
    }
};
