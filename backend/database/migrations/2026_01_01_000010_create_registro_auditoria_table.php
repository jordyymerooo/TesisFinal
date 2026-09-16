<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registro_auditoria', function (Blueprint $table) {
            $table->id('id_auditoria');
            $table->foreignId('id_administrador')->constrained('users', 'id_usuario')->restrictOnDelete();
            $table->string('accion', 100);
            $table->string('entidad', 100);
            $table->unsignedBigInteger('id_entidad')->nullable();
            $table->text('detalle')->nullable();
            $table->timestamp('fecha')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registro_auditoria');
    }
};
