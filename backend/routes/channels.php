<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat.{id_conversacion}', function ($user, $id_conversacion) {
    if (str_contains($id_conversacion, '_')) {
        [$id1, $id2] = explode('_', $id_conversacion);
        return (int) $user->id_usuario === (int) $id1 || (int) $user->id_usuario === (int) $id2;
    }
    return true;
});

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id_usuario === (int) $id;
});
