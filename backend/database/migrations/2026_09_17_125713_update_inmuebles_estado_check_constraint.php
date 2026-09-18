<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE inmuebles DROP CONSTRAINT IF EXISTS inmuebles_estado_check;");
        DB::statement("ALTER TABLE inmuebles ADD CONSTRAINT inmuebles_estado_check CHECK (estado::text = ANY (ARRAY['borrador'::text, 'publicado'::text, 'disponible'::text, 'ocupada'::text, 'ocupado'::text, 'reservado'::text, 'inactivo'::text]));");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE inmuebles DROP CONSTRAINT IF EXISTS inmuebles_estado_check;");
        DB::statement("ALTER TABLE inmuebles ADD CONSTRAINT inmuebles_estado_check CHECK (estado::text = ANY (ARRAY['borrador'::text, 'publicado'::text, 'reservado'::text, 'inactivo'::text]));");
    }
};
