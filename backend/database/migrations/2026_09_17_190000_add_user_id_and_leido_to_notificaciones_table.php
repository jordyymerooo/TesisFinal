<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notificaciones', function (Blueprint $table) {
            if (!Schema::hasColumn('notificaciones', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->after('id_usuario');
            }
            if (!Schema::hasColumn('notificaciones', 'leido')) {
                $table->boolean('leido')->default(false)->after('mensaje');
            }
        });

        // Sincronizar datos existentes
        DB::statement('UPDATE notificaciones SET user_id = id_usuario WHERE user_id IS NULL');
        DB::statement('UPDATE notificaciones SET leido = (leido_en IS NOT NULL)');
    }

    public function down(): void
    {
        Schema::table('notificaciones', function (Blueprint $table) {
            if (Schema::hasColumn('notificaciones', 'user_id')) {
                $table->dropColumn('user_id');
            }
            if (Schema::hasColumn('notificaciones', 'leido')) {
                $table->dropColumn('leido');
            }
        });
    }
};
