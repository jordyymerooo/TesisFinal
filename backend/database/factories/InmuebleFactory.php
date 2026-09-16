<?php

namespace Database\Factories;

use App\Models\Inmueble;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Inmueble>
 */
class InmuebleFactory extends Factory
{
    protected $model = Inmueble::class;

    // Títulos realistas para alojamientos estudiantiles en Manta cerca de la ULEAM
    private static array $titulos = [
        'Mini departamento amoblado',
        'Habitación privada para estudiante',
        'Suite amoblada cerca de la ULEAM',
        'Mini departamento con todo incluido',
        'Cuarto individual con baño privado',
        'Departamento compartido universitario',
        'Habitación amoblada zona Barbasquillo',
        'Suite estudiantil con wifi de fibra',
        'Cuarto luminoso a pasos de la ULEAM',
        'Mini depa independiente con cocina',
        'Habitación con aire acondicionado',
        'Departamento moderno para estudiantes',
        'Cuarto privado con escritorio y closet',
        'Suite con terraza vista al mar',
        'Habitación estudiantil zona tranquila',
    ];

    // Descripciones realistas para estudiantes
    private static array $descripciones = [
        'Espacioso y bien iluminado, con todo lo necesario para estudiar cómodamente.',
        'A solo minutos a pie de la entrada principal de la ULEAM. Zona segura y residencial.',
        'Incluye internet de alta velocidad por fibra óptica, agua caliente y área de lavado.',
        'Ambiente tranquilo ideal para el estudio universitario. Cocina equipada y closet amplio.',
        'Recién remodelado, con acabados modernos, buena ventilación y excelente iluminación.',
        'Edificio seguro con control de acceso, cámaras de vigilancia y área para parquear.',
        'Cerca de supermercados, farmacias, papelerías y paradas de transporte público.',
    ];

    public function definition(): array
    {
        $tipos = ['cuarto', 'mini_departamento', 'departamento_compartido', 'suite'];

        return [
            'titulo'                => $this->faker->randomElement(self::$titulos),
            'descripcion'           => $this->faker->randomElement(self::$descripciones),
            'precio'                => $this->faker->randomFloat(2, 80, 250), // Precios entre $80 y $250
            'tipo'                  => $this->faker->randomElement($tipos),
            'estado'                => 'publicado', // Estado = 'publicado'
            'capacidad'             => $this->faker->numberBetween(1, 3),
            'servicios_incluidos'   => $this->faker->boolean(70),
            'calificacion_promedio' => $this->faker->randomFloat(1, 3.5, 5.0), // Calificación entre 3.5 y 5.0
            // id_arrendador se asigna al crear en el seeder
        ];
    }

    /** Estado borrador (no aparecerá en el mapa) */
    public function borrador(): static
    {
        return $this->state(['estado' => 'borrador']);
    }

    /** Estado publicado (visible en el mapa) */
    public function publicado(): static
    {
        return $this->state(['estado' => 'publicado']);
    }
}
