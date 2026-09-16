<?php

namespace Database\Factories;

use App\Models\Ubicacion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ubicacion>
 *
 * Genera coordenadas en Manta cerca del campus de la ULEAM.
 * Coordenadas base ULEAM: Latitud aprox -0.9555, Longitud aprox -80.7380
 */
class UbicacionFactory extends Factory
{
    protected $model = Ubicacion::class;

    // Coordenadas base ULEAM Manta
    private const LAT_BASE = -0.9555;
    private const LON_BASE = -80.7380;

    // Sectores y ciudadelas universitarias reales en Manta
    private static array $sectores = [
        'Barbasquillo',
        'Los Eléctricos',
        'La Dolorosa',
        'El Paraíso',
        'Ciudadela del Maestro',
        'La Paz',
        'El Centro',
        'Tarqui',
        'Las Peñas',
        'Ciudadela Universitaria',
    ];

    private static array $referencias = [
        'A 2 cuadras de la entrada principal de la ULEAM',
        'Frente a la puerta 2 universitaria, edificio esquinero',
        'A media cuadra de la parada de buses de la ULEAM',
        'Calle peatonal segura, casa de 2 pisos con portón azul',
        'Diagonal a la facultad de informática, cerca del minimarket',
        'A 150 metros del complejo deportivo universitario',
        'Frente al parque de la urbanización, zona estudiantil',
        'Callejón tranquilo junto a la avenida circunvalación',
        'A espaldas del rectorado ULEAM, edificio moderno',
        'Sobre la vía principal Barbasquillo, frente a la cafetería universitaria',
    ];

    public function definition(): array
    {
        // Pequeño offset aleatorio con mt_rand sobre las coordenadas base (±0.0080 grados ≈ 600m - 900m)
        $latOffset = mt_rand(-80, 80) / 10000.0;
        $lonOffset = mt_rand(-80, 80) / 10000.0;

        $latitud  = round(self::LAT_BASE + $latOffset, 7);
        $longitud = round(self::LON_BASE + $lonOffset, 7);

        // Distancia aproximada a la ULEAM en km
        $distKm = round(sqrt(pow($latOffset * 111.0, 2) + pow($lonOffset * 90.0, 2)), 2);

        return [
            'latitud'               => $latitud,
            'longitud'              => $longitud,
            'direccion_referencial' => $this->faker->randomElement(self::$referencias),
            'sector'                => $this->faker->randomElement(self::$sectores),
            'distancia_uleam_km'    => $distKm,
            // id_inmueble se asigna al encadenar con Inmueble
        ];
    }
}
