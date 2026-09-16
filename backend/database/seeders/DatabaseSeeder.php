<?php

namespace Database\Seeders;

use App\Models\Fotografia;
use App\Models\Inmueble;
use App\Models\Perfil;
use App\Models\Ubicacion;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Genera datos realistas para la presentación de tesis:
     * - 3 usuarios base (1 admin, 1 estudiante, 1 arrendador)
     * - 14 inmuebles generados con factories y encadenados con ubicaciones cerca de la ULEAM y fotografías Unsplash
     */
    public function run(): void
    {
        // ──────────────────────────────────────────────────────────────
        // 1. USUARIOS BASE
        // ──────────────────────────────────────────────────────────────

        // 1. Administrador
        $admin = User::firstOrCreate(
            ['correo' => 'admin@uleam.edu.ec'],
            [
                'id_rol'     => 3,
                'nombres'    => 'Administrador Sistema',
                'clave_hash' => Hash::make('password123'),
                'estado'     => 'activo',
            ]
        );

        // 2. Arrendador
        $arrendador = User::firstOrCreate(
            ['correo' => 'arrendador@uleam.edu.ec'],
            [
                'id_rol'     => 2,
                'nombres'    => 'Carlos Mendoza Bravo',
                'clave_hash' => Hash::make('password123'),
                'estado'     => 'activo',
            ]
        );

        Perfil::firstOrCreate(
            ['id_usuario' => $arrendador->id_usuario],
            [
                'telefono'             => '0991234567',
                'ciudad_origen'        => 'Manta',
                'documento_verificado' => true,
                'foto_perfil_url'      => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            ]
        );

        // 3. Arrendadores pendientes de verificación KYC (para el panel administrativo)
        $pendingLandlords = [
            [
                'nombres' => 'Carlos Mendoza Moreira',
                'correo' => 'carlos.mendoza.kyc@gmail.com',
                'telefono' => '0991456789',
                'foto' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
                'doc' => 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?auto=format&fit=crop&w=600&q=80',
            ],
            [
                'nombres' => 'María Elena Delgado',
                'correo' => 'maria.delgado.kyc@hotmail.com',
                'telefono' => '0990987654',
                'foto' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
                'doc' => 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?auto=format&fit=crop&w=600&q=80',
            ],
            [
                'nombres' => 'Ing. Patricio Cedeño Loor',
                'correo' => 'pcedeno.kyc@arriendosmanabi.ec',
                'telefono' => '0991223344',
                'foto' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
                'doc' => 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?auto=format&fit=crop&w=600&q=80',
            ],
        ];

        foreach ($pendingLandlords as $pLandlord) {
            $u = User::firstOrCreate(
                ['correo' => $pLandlord['correo']],
                [
                    'id_rol'     => 2,
                    'nombres'    => $pLandlord['nombres'],
                    'clave_hash' => Hash::make('password123'),
                    'estado'     => 'pendiente',
                ]
            );
            Perfil::updateOrCreate(
                ['id_usuario' => $u->id_usuario],
                [
                    'telefono'             => $pLandlord['telefono'],
                    'ciudad_origen'        => 'Manta',
                    'documento_verificado' => false,
                    'documento_tipo'       => 'cedula',
                    'documento_url'        => $pLandlord['doc'],
                    'foto_perfil_url'      => $pLandlord['foto'],
                ]
            );
        }

        // 4. Estudiante
        $estudiante = User::firstOrCreate(
            ['correo' => 'estudiante@uleam.edu.ec'],
            [
                'id_rol'     => 1,
                'nombres'    => 'Jordy Zambrano',
                'clave_hash' => Hash::make('password123'),
                'estado'     => 'activo',
            ]
        );

        Perfil::firstOrCreate(
            ['id_usuario' => $estudiante->id_usuario],
            [
                'telefono'             => '0987654321',
                'ciudad_origen'        => 'Portoviejo',
                'documento_verificado' => true,
                'foto_perfil_url'      => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
            ]
        );

        // ──────────────────────────────────────────────────────────────
        // 2. INMUEBLES, UBICACIONES Y FOTOGRAFÍAS
        // ──────────────────────────────────────────────────────────────

        $unsplashFotos = [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1464082354059-27db6ce50048?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
        ];

        // Generamos 14 inmuebles usando el InmuebleFactory
        $inmuebles = Inmueble::factory()
            ->count(14)
            ->create([
                'id_arrendador' => $arrendador->id_usuario,
            ]);

        // Creación en cadena de ubicaciones y al menos 1 fotografía por cada inmueble
        foreach ($inmuebles as $index => $inmueble) {
            // Ubicación con UbicacionFactory (cerca de la ULEAM)
            Ubicacion::factory()->create([
                'id_inmueble' => $inmueble->id_inmueble,
            ]);

            // Fotografía de prueba realista de Unsplash
            $fotoUrl = $unsplashFotos[$index % count($unsplashFotos)];
            Fotografia::create([
                'id_inmueble' => $inmueble->id_inmueble,
                'url'         => $fotoUrl,
                'es_portada'  => true,
                'orden'       => 1,
            ]);
        }

        // ──────────────────────────────────────────────────────────────
        // 3. SOLICITUDES DE RESERVA PARA EL ARRENDADOR
        // ──────────────────────────────────────────────────────────────
        $estudiantesData = [
            [
                'nombres' => 'Andrea Soledispa',
                'correo'  => 'andrea.soledispa@live.uleam.edu.ec',
                'foto'    => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
                'ciudad'  => 'Manta',
                'estado'  => 'pendiente',
                'mensaje' => 'Hola estimado, soy estudiante de Ing. en Software (6to Semestre). ¿Está disponible para ingresar el próximo mes?',
            ],
            [
                'nombres' => 'Carlos Mendoza P.',
                'correo'  => 'carlos.mendoza.p@live.uleam.edu.ec',
                'foto'    => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
                'ciudad'  => 'Portoviejo',
                'estado'  => 'pendiente',
                'mensaje' => 'Buenas tardes, estudio Medicina en 4to Año. Me gustaría coordinar una visita mañana por la tarde si es posible.',
            ],
            [
                'nombres' => 'Valeria Moreira',
                'correo'  => 'valeria.moreira@live.uleam.edu.ec',
                'foto'    => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                'ciudad'  => 'Chone',
                'estado'  => 'aceptada',
                'mensaje' => 'Hola, ya realicé el depósito acordado para apartar la suite. ¡Muchas gracias!',
            ],
            [
                'nombres' => 'Kevin Castro',
                'correo'  => 'kevin.castro@live.uleam.edu.ec',
                'foto'    => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
                'ciudad'  => 'Montecristi',
                'estado'  => 'rechazada',
                'mensaje' => 'Buenas, quisiera saber si se permiten dos personas y mascotas en esta habitación.',
            ],
        ];

        foreach ($estudiantesData as $idx => $s) {
            $studentUser = User::firstOrCreate(
                ['correo' => $s['correo']],
                [
                    'id_rol'     => 1,
                    'nombres'    => $s['nombres'],
                    'clave_hash' => Hash::make('estudiante123'),
                    'estado'     => 'activo',
                ]
            );

            Perfil::firstOrCreate(
                ['id_usuario' => $studentUser->id_usuario],
                [
                    'telefono'             => '099' . str_pad((string)($idx * 111111), 7, '8', STR_PAD_LEFT),
                    'ciudad_origen'        => $s['ciudad'],
                    'documento_verificado' => true,
                    'foto_perfil_url'      => $s['foto'],
                ]
            );

            if ($inmuebles->count() > $idx) {
                \App\Models\SolicitudReserva::firstOrCreate(
                    [
                        'id_estudiante' => $studentUser->id_usuario,
                        'id_inmueble'   => $inmuebles[$idx]->id_inmueble,
                    ],
                    [
                        'estado'                => $s['estado'],
                        'fecha_deseada_ingreso' => now()->addDays($idx + 3),
                        'mensaje_inicial'       => $s['mensaje'],
                        'created_at'            => now()->subHours($idx * 6 + 2),
                    ]
                );
            }
        }

        // ──────────────────────────────────────────────────────────────
        // 4. MENSAJES DE CHAT DE PRUEBA
        // ──────────────────────────────────────────────────────────────
        $inmuebleRef = $inmuebles->first();
        if ($inmuebleRef) {
            \App\Models\Mensaje::firstOrCreate(
                [
                    'id_remitente'    => $estudiante->id_usuario,
                    'id_destinatario' => $arrendador->id_usuario,
                    'contenido'       => 'Hola Don Carlos, ¿el departamento aún está disponible para visitar esta tarde?',
                ],
                [
                    'id_inmueble'     => $inmuebleRef->id_inmueble,
                    'leido'           => true,
                    'fecha'           => now()->subHours(4),
                    'created_at'      => now()->subHours(4),
                ]
            );

            \App\Models\Mensaje::firstOrCreate(
                [
                    'id_remitente'    => $arrendador->id_usuario,
                    'id_destinatario' => $estudiante->id_usuario,
                    'contenido'       => '¡Hola Jordy! Sí, con mucho gusto. Te espero a las 4:00 PM frente a la facultad.',
                ],
                [
                    'id_inmueble'     => $inmuebleRef->id_inmueble,
                    'leido'           => false,
                    'fecha'           => now()->subHours(2),
                    'created_at'      => now()->subHours(2),
                ]
            );
        }

        $this->command->info('✅ Seeder completado: 3 usuarios + 14 inmuebles generados con ubicaciones ULEAM, solicitudes y mensajes de chat.');
    }
}
