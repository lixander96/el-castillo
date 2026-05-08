import { 
  Body, 
  Controller, 
  Get, 
  Post, 
  UseGuards, 
  UseInterceptors 
} from '@nestjs/common';
import { MailerService } from './mailer.service';
import { SendEmailDto } from './mail.interface';
import { SendTestMessageDTO } from './dtos/send-test-message.dto';
import { ApiTags, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Address } from 'nodemailer/lib/mailer';
import { UserAuth } from '../modules/auth/decorators/user-auth.decorator';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { User } from '../modules/user/entities/user.entity';

@ApiTags('mailer')
@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('test')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'The test email has been successfully sent.',
  })
  @ApiBody({ type: SendTestMessageDTO })
  async send_test_email(@Body() dto: SendTestMessageDTO, @UserAuth() user: User) {
    return this.mailerService.send({
      recipients: dto.destination.map<Address>(str => ({address: str, name: ''})),
      subject: 'Test Mailer',
      html: dto.message
    });
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returns the status of the mailer service.',
  })
  async getStatus() {
    return { status: 'Mailer service is running' };
  }
}
