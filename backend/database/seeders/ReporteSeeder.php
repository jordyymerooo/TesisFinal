<?php

namespace Database\Seeders;

use App\Models\Inmueble;
use App\Models\Reporte;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReporteSeeder extends Seeder
{
    public function run(): void
    {
        if (Reporte::count() === 0) {
            $est = User::where('id_rol', 1)->first();
            $arr = User::where('id_rol', 2)->first();
            $inm = Inmueble::first();

            if ($est && $arr) {
                Reporte::create([
                    'estudiante_id' => $est->id_usuario,
                    'arrendador_id' => $arr->id_usuario,
                    'inmueble_id'   => $inm ? $inm->id_inmueble : null,
                    'motivo'        => 'Información falsa/engañosa',
                    'descripcion'   => 'Las fotografías mostradas no concuerdan con la habitación entregada y el costo de servicios no estaba contemplado.',
                    'estado'        => 'pendiente',
                ]);

                Reporte::create([
                    'estudiante_id' => $est->id_usuario,
                    'arrendador_id' => $arr->id_usuario,
                    'inmueble_id'   => $inm ? $inm->id_inmueble : null,
                    'motivo'        => 'Intento de fraude',
                    'descripcion'   => 'El anunciante exige adelantos por transferencia bancaria sin permitir validar el contrato ni visitar el inmueble.',
                    'estado'        => 'pendiente',
                ]);

                Reporte::create([
                    'estudiante_id' => $est->id_usuario,
                    'arrendador_id' => $arr->id_usuario,
                    'inmueble_id'   => $inm ? $inm->id_inmueble : null,
                    'motivo'        => 'El inmueble ya no está disponible',
                    'descripcion'   => 'El cuarto fue rentado a otra persona hace semanas pero sigue apareciendo disponible para estudiantes.',
                    'estado'        => 'resuelto',
                ]);
            }
        }
    }
}
