<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('perfiles', function (Blueprint $table) {
            if (!Schema::hasColumn('perfiles', 'documento_posterior_url')) {
                $table->string('documento_posterior_url')->nullable()->after('documento_url');
            }
            if (!Schema::hasColumn('perfiles', 'recibo_luz_url')) {
                $table->string('recibo_luz_url')->nullable()->after('documento_posterior_url');
            }
        });
    }

    public function down(): void
    {
        Schema::table('perfiles', function (Blueprint $table) {
            if (Schema::hasColumn('perfiles', 'documento_posterior_url')) {
                $table->dropColumn('documento_posterior_url');
            }
            if (Schema::hasColumn('perfiles', 'recibo_luz_url')) {
                $table->dropColumn('recibo_luz_url');
            }
        });
    }
};
