<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Contracts\TwoFactorLoginResponse as TwoFactorLoginResponseContract;

class LoginResponse implements LoginResponseContract, TwoFactorLoginResponseContract
{
    public function toResponse($request)
    {
        $user = $request->user();

        if ($user && $user->hasRole('kasir') && ! $user->hasAnyRole(['owner', 'admin'])) {
            return redirect()->intended('/pos');
        }

        return redirect()->intended(config('fortify.home', '/dashboard'));
    }
}
