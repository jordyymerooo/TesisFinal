<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
            return (new MailMessage)
                ->subject('Verifica tu Dirección de Correo Electrónico - ULEAM Rental')
                ->greeting('¡Hola ' . ($notifiable->nombres ?? 'Usuario') . '!')
                ->line('Por favor, haz clic en el botón de abajo para verificar tu dirección de correo electrónico y continuar con tu proceso.')
                ->action('Verificar Correo Electrónico', $url)
                ->line('Si no creaste una cuenta, no es necesario realizar ninguna acción.')
                ->salutation('Saludos, Equipo ULEAM Rental');
        });
    }
}
