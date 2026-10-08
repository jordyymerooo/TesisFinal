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
        // En PostgreSQL los enum generan un CHECK constraint (comunicados_destinatarios_check)
        // que debe removerse explícitamente para permitir nuevos valores.
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE comunicados DROP CONSTRAINT IF EXISTS comunicados_destinatarios_check;');

        Schema::table('comunicados', function (Blueprint $table) {
            $table->string('destinatarios')->default('todos_verificados')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('comunicados', function (Blueprint $table) {
            $table->string('destinatarios')->default('todos')->change();
        });
    }
};
