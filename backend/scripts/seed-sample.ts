import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Event } from '../src/modules/events/entities/event.entity';
import { TicketType } from '../src/modules/events/entities/ticket-type.entity';
import { EventStatusEnum } from '../src/modules/events/entities/event-status.entity';

// Ajustá según tu configuración actual de TypeORM:
const ds = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgres://root:123456@localhost:5432/el-castillo',
  entities: [Event, TicketType],
  synchronize: false, // en dev si querés: true (¡ojo!)
  logging: false,
});

async function run() {
  await ds.initialize();
  const evRepo = ds.getRepository(Event);
  const ttRepo = ds.getRepository(TicketType);

  const event = evRepo.create({
    title: 'Noche de Gala',
    description: 'Show en vivo con orquesta',
    date: '2025-11-15',
    time: '21:00',
    space: 'Salón Principal',
    capacity: 300,
    ticketsSold: 0,
    price: 20000,
    status: EventStatusEnum.UPCOMING,
    image: null,
    category: 'Show',
    featured: true,
    ticketTypes: [],
  });
  await evRepo.save(event);

  const generales = ttRepo.create({
    event,
    name: 'General',
    description: 'Acceso general',
    price: 20000,
    total: 250,
    sold: 0,
    available: 250,
  });
  const vip = ttRepo.create({
    event,
    name: 'VIP',
    description: 'Mesa preferencial',
    price: 35000,
    total: 50,
    sold: 0,
    available: 50,
  });
  await ttRepo.save([generales, vip]);

  console.log('Seed OK:', event.id);
  await ds.destroy();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
