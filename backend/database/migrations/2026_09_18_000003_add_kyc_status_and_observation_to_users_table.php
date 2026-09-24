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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'estado_kyc')) {
                $table->string('estado_kyc', 50)->nullable()->default(null)->after('estado');
            }
            if (!Schema::hasColumn('users', 'kyc_observacion')) {
                $table->text('kyc_observacion')->nullable()->after('estado_kyc');
            }
        });

        Schema::table('perfiles', function (Blueprint $table) {
            if (!Schema::hasColumn('perfiles', 'kyc_observacion')) {
                $table->text('kyc_observacion')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'kyc_observacion')) {
                $table->dropColumn('kyc_observacion');
            }
            if (Schema::hasColumn('users', 'estado_kyc')) {
                $table->dropColumn('estado_kyc');
            }
        });

        Schema::table('perfiles', function (Blueprint $table) {
            if (Schema::hasColumn('perfiles', 'kyc_observacion')) {
                $table->dropColumn('kyc_observacion');
            }
        });
    }
};
