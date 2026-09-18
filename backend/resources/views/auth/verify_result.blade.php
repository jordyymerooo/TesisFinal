<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificación Exitosa - ULEAM Rental</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

        body {
            font-family: 'Inter', sans-serif;
        }
    </style>
</head>

<body class="bg-slate-50 h-screen flex items-center justify-center p-4">

    <div class="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden text-center border border-slate-100">

        <!-- Header Rojo ULEAM -->
        <div class="bg-[#8C1515] p-6">
            <h1 class="text-white text-xl font-bold tracking-wide">ULEAM Rental</h1>
            <p class="text-red-100 text-sm mt-1">Alojamiento Universitario Segurizado</p>
        </div>

        <!-- Contenido Central -->
        <div class="p-8">
            <!-- Ícono de Check Animado/Verde -->
            <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 mb-6">
                <svg class="h-12 w-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>

            <h2 class="text-2xl font-bold text-slate-800 mb-2">¡Verificación Exitosa!</h2>

            <p class="text-slate-600 mb-6 leading-relaxed">
                Tu correo electrónico ha sido confirmado correctamente en nuestra base de datos.
            </p>

            <div class="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
                <p class="text-sm text-slate-700 font-medium">
                    Ya puedes cerrar esta ventana y regresar a la aplicación en tu celular para continuar.
                </p>
            </div>

            <button onclick="window.close()"
                class="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-4 rounded-lg transition duration-200">
                Cerrar ventana
            </button>
        </div>

        <!-- Footer -->
        <div class="bg-slate-50 py-4 border-t border-slate-100">
            <p class="text-xs text-slate-400">
                &copy; {{ date('Y') }} Universidad Laica Eloy Alfaro de Manabí
            </p>
        </div>
    </div>

</body>

</html>