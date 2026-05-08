import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../../../config/config.configuration';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly config: ConfigService<EnvironmentVariables>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: config.get('GOOGLE_CLIENT_ID'),
      clientSecret: config.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.get('GOOGLE_CALLBACK_URL'),
      scope: ['profile', 'email'],
    });
  }

  // Se llama después de que Google valida al usuario
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    // Campos típicos: emails[0].value, name.givenName, name.familyName, photos[0].value
    const email = profile.emails?.[0]?.value;
    const firstName = profile.name?.givenName || '';
    const lastName = profile.name?.familyName || '';
    const picture = profile.photos?.[0]?.value;

    // Crear o encontrar usuario en tu base
    // IMPORTANTE: si tu entidad no tiene "email", usá "email" como email.
    const user = await this.authService.findOrCreateOAuthUser({
      provider: 'google',
      providerId: profile.id,
      email,
      firstName,
      lastName,
      picture,
    });

    // Lo que retornes aquí queda en req.user en el guard
    return user;
  }
}
