import { BadRequestException, Injectable } from '@nestjs/common';
import { Role, User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginResDTO } from './dtos/login-res.dto';
import { JwtPayload } from './payloads/jwt.payload';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChangePasswordReqDTO } from './dtos/change-password-req.dto';
import { RegisterReqDTO } from './dtos/register-req.dto';

type OAuthUserInput = {
  provider: 'google';
  providerId: string;
  email?: string | null;
  firstName?: string;
  lastName?: string;
  picture?: string | null;
};


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly _authRepository: Repository<User>,
    private _jwtService: JwtService,
  ) { }

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this._authRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const match = await bcrypt.compare(pass, user.password);
    if (!match) return null;
 
    return user;
  }

  async validateJwt(payload: JwtPayload): Promise<User | null> {
    const { id, email, password } = payload;
    const user = await this._authRepository.findOne({
      where: { id, email, password },
    });
    return user;
  }

  async login(user: User): Promise<LoginResDTO> {
    const payload: JwtPayload = {
      email: user.email,
      id: user.id,
      password: user.password,
    };
    return plainToClass(LoginResDTO, {
      ...user,
      access_token: this._jwtService.sign(payload),
    });
  }

  async register(dto: RegisterReqDTO): Promise<LoginResDTO> {
    const exists = await this._authRepository.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new BadRequestException('There is already a user with this email.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this._authRepository.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      password: hashedPassword,
      role: Role.VISITANTE,
    });

    const saved = await this._authRepository.save(user);
    return this.login(saved);
  }

  async changePassword(user: User, changePasswordReq: ChangePasswordReqDTO): Promise<User> {
    const { oldPassword, newPassword } = changePasswordReq;

    const dbUser = await this._authRepository.findOne({
      where: { id: user.id },
    });
    const match = await bcrypt.compare(oldPassword, dbUser.password);
    if (!match) {
      throw new BadRequestException('Invalid old password');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    dbUser.password = hashedPassword;

    await this._authRepository.save(dbUser);
    return dbUser;
  }

  async findOrCreateOAuthUser(input: OAuthUserInput) {
    const fallbackEmail = input.email ?? `${input.provider}_${input.providerId}@oauth.elcastillo`;

    let user: User | null = null;

    if (input.email) {
      user = await this._authRepository.findOne({ where: { email: input.email } });
    }

    if (!user) {
      user = await this._authRepository.findOne({
        where: {
          oauthProvider: input.provider,
          oauthProviderId: input.providerId,
        },
      });
    }

    if (!user) {
      const randomPass = await bcrypt.hash(
        `oauth_${input.provider}_${input.providerId}_${Date.now()}`,
        10,
      );

      user = this._authRepository.create({
        email: fallbackEmail,
        firstName: input.firstName ?? '',
        lastName: input.lastName ?? '',
        password: randomPass,
        role: Role.VISITANTE,
        oauthProvider: input.provider,
        oauthProviderId: input.providerId,
        avatar: input.picture ?? null,
      });
    } else {
      let hasChanges = false;

      if (input.email && user.email !== input.email) {
        user.email = input.email;
        hasChanges = true;
      }

      if (!user.oauthProvider || !user.oauthProviderId) {
        user.oauthProvider = input.provider;
        user.oauthProviderId = input.providerId;
        hasChanges = true;
      }

      if (input.firstName && !user.firstName) {
        user.firstName = input.firstName;
        hasChanges = true;
      }

      if (input.lastName && !user.lastName) {
        user.lastName = input.lastName;
        hasChanges = true;
      }

      if (input.picture && user.avatar !== input.picture) {
        user.avatar = input.picture;
        hasChanges = true;
      }

      if (!hasChanges) {
        return user;
      }
    }

    return this._authRepository.save(user);
  }

  async loginOAuth(user: User) {
    const loginRes = await this.login(user);
    return {
      accessToken: loginRes.access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar ?? null,
      },
    };
  }
}
