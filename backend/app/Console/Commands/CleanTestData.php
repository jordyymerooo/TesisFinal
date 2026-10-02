<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\User;

class CleanTestData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:clean-test-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Limpia los datos transaccionales de prueba dejando intacto al Administrador';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando limpieza de la base de datos de pruebas...');

        // Desactivar restricciones de claves foráneas
        Schema::disableForeignKeyConstraints();

        // Limpiar todas las tablas transaccionales
        $tables = [
            'fotografias',
            'ubicaciones',
            'inmueble_servicios', // Tabla pivote (si existe)
            'solicitudes_reserva',
            'verificaciones',
            'mensajes',
            'chats',
            'reportes',
            'favoritos',
            'inmuebles',
            'perfiles',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                DB::table($table)->truncate();
                $this->line("Tabla {$table} truncada.");
            }
        }

        // Eliminar usuarios excepto el administrador (asumiendo id_rol 1 para Admin)
        $deletedUsers = User::where('id_rol', '!=', 1)->delete();
        $this->line("Se eliminaron {$deletedUsers} usuarios de prueba.");

        // Reactivar restricciones de claves foráneas
        Schema::enableForeignKeyConstraints();

        $this->info('¡Base de datos limpia y lista para un flujo fresco!');
    }
}
