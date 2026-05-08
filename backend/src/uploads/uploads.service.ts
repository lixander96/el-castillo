import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { Express } from 'express';
import { EnvironmentVariables } from '../config/config.configuration';

@Injectable()
export class UploadsService implements OnModuleInit {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor(private readonly config: ConfigService<EnvironmentVariables>) {}

  onModuleInit() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  get uploadPath(): string {
    return this.uploadDir;
  }

  private buildFileUrl(filename: string): string {
    const baseUrl = this.config.get('BACKEND_URL') || '';
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const relativePath = `/uploads/${filename}`;
    return normalizedBase ? `${normalizedBase}${relativePath}` : relativePath;
  }

  mapFileResponse(file: Express.Multer.File) {
    return {
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: this.buildFileUrl(file.filename),
      path: `/uploads/${file.filename}`,
    };
  }
}

