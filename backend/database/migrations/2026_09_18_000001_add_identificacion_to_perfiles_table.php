<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('perfiles', 'identificacion')) {
            Schema::table('perfiles', function (Blueprint $table) {
                $table->string('identificacion', 20)->nullable()->after('id_usuario');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('perfiles', 'identificacion')) {
            Schema::table('perfiles', function (Blueprint $table) {
                $table->dropColumn('identificacion');
            });
        }
    }
};
