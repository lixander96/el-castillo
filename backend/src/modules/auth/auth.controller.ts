import { Body, Controller, Post, UseGuards, Get, UseInterceptors, ClassSerializerInterceptor, SerializeOptions, Patch, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { UserAuth } from './decorators/user-auth.decorator';
import { LoginReqDTO } from './dtos/login-req.dto';
import { RegisterReqDTO } from './dtos/register-req.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ChangePasswordReqDTO } from './dtos/change-password-req.dto';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../../config/config.configuration';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ excludeExtraneousValues: true })
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly _authService: AuthService,
    private readonly _config: ConfigService<EnvironmentVariables>,
  ) { }

  @Post('login')
  @ApiBody({ type: LoginReqDTO })
  @UseGuards(LocalAuthGuard)
  login(@UserAuth() user: User) {
    return this._authService.login(user);
  }

  @Post('register')
  @ApiBody({ type: RegisterReqDTO })
  register(@Body() dto: RegisterReqDTO) {
    return this._authService.register(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@UserAuth() user: User) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('profile/password')
  @ApiBody({ type: ChangePasswordReqDTO })
  changePassword(user: User, changePasswordReq: ChangePasswordReqDTO) {
    return this._authService.changePassword(user, changePasswordReq)
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Passport redirige a Google automáticamente
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res) {
    // req.user viene del validate() de GoogleStrategy
    const { accessToken } = await this._authService.loginOAuth(req.user);
    const frontend = this._config.get('FRONTEND_URL') || 'http://localhost:3001';
    // Redirige a frontend con token en query (simple y rápido)
    return res.redirect(`${frontend}/auth/callback?token=${accessToken}`);
  }

}
