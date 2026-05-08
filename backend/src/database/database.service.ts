import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { EnvironmentVariables } from "../config/config.configuration";
import { User } from "../modules/user/entities/user.entity";
import { Payment } from "../modules/payments/entitites/payment.entity";
import { Order } from "../modules/orders/entities/order.entity";
import { TicketType } from "../modules/events/entities/ticket-type.entity";
import { OrderItem } from "../modules/orders/entities/order-item.entity";
import { Ticket } from "../modules/orders/entities/ticket.entity";
import { Event } from "../modules/events/entities/event.entity";
import { Coupon } from "../modules/coupons/entities/coupon.entity";

export const databaseProviders = [
    TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService<EnvironmentVariables>): TypeOrmModuleOptions => ({
            type: 'postgres',
            host: config.get("TYPEORM_HOST"),
            username: config.get("TYPEORM_USERNAME"),
            password: config.get("TYPEORM_PASSWORD"),
            database: config.get("TYPEORM_DATABASE"),
            synchronize: true,
            migrations: ["dist/database/migrations/*{.ts,.js}"],
            migrationsTableName: "migrations",
            // url: process.env.DATABASE_URL,
            entities: [
                Event,
                TicketType,
                Order,
                OrderItem,
                Payment,   // <- imprescindible
                Ticket,
                User,      // si la usás
                Coupon,
                // cualquier otra
            ],
        })
    })
]