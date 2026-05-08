import { TypeOrmModuleOptions } from "@nestjs/typeorm"

export type TypeORMConnection = TypeOrmModuleOptions["type"]

export interface EnvironmentVariables {
    PORT: number;
    TYPEORM_CONNECTION: TypeORMConnection;
    TYPEORM_HOST: string;
    TYPEORM_PORT: number;
    TYPEORM_USERNAME: string;
    TYPEORM_PASSWORD: string;
    TYPEORM_DATABASE: string;
    TYPEORM_ENTITIES: string;
    TYPEORM_SYNCHRONIZE: boolean;
    ADMIN_USERNAME: string;
    ADMIN_PASSWORD: string;
    JWT_SECRET: string;

    MULTER_DEST: string;

    SSL_CERTIFICATE: string;
    SSL_KEY: string;
    WHATSAPP_TOKEN: string;
    WHATSAPP_PHONE_NUMBER_ID: string;
    BASE_PUBLIC_URL: string;

    MAILER_HOST: string,
    MAILER_PORT: string,
    MAILER_USER: string,
    MAILER_PASS: string,

    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_CALLBACK_URL: string;
    FRONTEND_URL: string;
    BACKEND_URL: string;
}

export default (): EnvironmentVariables => {
    return {
        PORT: process.env['PORT'] ? Number(process.env['PORT']) : 3000,
        TYPEORM_CONNECTION: process.env['TYPEORM_CONNECTION'] as TypeORMConnection || 'postgres',
        TYPEORM_HOST: process.env['TYPEORM_HOST'] || 'localhost',
        TYPEORM_PORT: +process.env['TYPEORM_HOST'] || 5432,
        TYPEORM_USERNAME: process.env['TYPEORM_USERNAME'] || 'root',
        TYPEORM_PASSWORD: process.env['TYPEORM_PASSWORD'] || '',
        TYPEORM_DATABASE: process.env['TYPEORM_DATABASE'],
        TYPEORM_ENTITIES: process.env['TYPEORM_ENTITIES'] || 'dist/**/*.entity.ts',
        TYPEORM_SYNCHRONIZE: process.env['TYPEORM_SYNCHRONIZE'] ? (process.env['TYPEORM_SYNCHRONIZE']).toLowerCase() === 'true' : false,
        ADMIN_USERNAME: process.env['ADMIN_USERNAME'] || 'admin',
        ADMIN_PASSWORD: process.env['ADMIN_PASSWORD'] || 'Pa$$w0rd01',
        JWT_SECRET: process.env['JWT_SECRET'],
        SSL_CERTIFICATE: process.env['SSL_CERTIFICATE'],
        SSL_KEY: process.env['SSL_KEY'],

        MULTER_DEST: process.env['MULTER_DEST'],

        WHATSAPP_TOKEN: process.env['WHATSAPP_TOKEN'],
        WHATSAPP_PHONE_NUMBER_ID: process.env['WHATSAPP_PHONE_NUMBER_ID'],
        BASE_PUBLIC_URL: process.env['BASE_PUBLIC_URL'],

        MAILER_HOST: process.env['MAILER_HOST'] || '',
        MAILER_PORT: process.env['MAILER_PORT'] || '',
        MAILER_USER: process.env['MAILER_USER'] || '',
        MAILER_PASS: process.env['MAILER_PASS'] || '',

        GOOGLE_CLIENT_ID: process.env['GOOGLE_CLIENT_ID'],
        GOOGLE_CLIENT_SECRET: process.env['GOOGLE_CLIENT_SECRET'],
        GOOGLE_CALLBACK_URL: process.env['GOOGLE_CALLBACK_URL'],
        FRONTEND_URL: process.env['FRONTEND_URL'] || 'http://localhost:3001',
        BACKEND_URL: process.env['BACKEND_URL'] || 'http://localhost:3000',
    }
}
