<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('chats')) {
            Schema::create('chats', function (Blueprint $table) {
                $table->id();
                $table->foreignId('id_estudiante')->constrained('users', 'id_usuario')->cascadeOnDelete();
                $table->foreignId('id_arrendador')->constrained('users', 'id_usuario')->cascadeOnDelete();
                $table->foreignId('id_inmueble')->nullable()->constrained('inmuebles', 'id_inmueble')->nullOnDelete();
                $table->text('ultimo_mensaje_texto')->nullable();
                $table->timestamp('ultimo_mensaje_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('chats');
    }
};
