import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { join } from 'path';
import { EventsService } from './events.service';

// Mismos user-agents que detectaba el nginx para previews sociales.
const SOCIAL_BOT_RE =
  /(facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|WhatsApp|TelegramBot|Discordbot|Pinterest|SkypeUriPreview|vkShare|W3C_Validator|Googlebot|bingbot|Applebot)/i;

const SPA_INDEX = join(process.cwd(), 'client', 'index.html');

// Sirve /evento/:slug: HTML con Open Graph a los bots de redes sociales y la
// SPA (index.html) a los usuarios. Excluido del prefijo global /api en main.ts
// para que la URL compartible siga siendo /evento/<slug>.
@ApiExcludeController()
@Controller()
export class OgController {
  constructor(private readonly events: EventsService) {}

  @Get('evento/:slug')
  async evento(@Param('slug') slug: string, @Req() req: Request, @Res() res: Response) {
    const ua = req.headers['user-agent'] || '';
    if (SOCIAL_BOT_RE.test(ua)) {
      try {
        res.type('html').send(await this.events.buildOgHtml(slug));
        return;
      } catch {
        // evento inexistente: cae a la SPA igual
      }
    }
    res.sendFile(SPA_INDEX, (err) => {
      if (err && !res.headersSent) res.status(404).end();
    });
  }
}
