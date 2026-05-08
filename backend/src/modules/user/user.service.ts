import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserReqDTO } from './dtos/create-user-req.dto';
import { Role, User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserReqDTO } from './dtos/update-user-req.dto';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    private readonly _configService: ConfigService,
  ) {}

  onModuleInit() {
    this.createAdminIfNotExist();
  }

  async create(dto: CreateUserReqDTO) {
    const exist = await this._userRepository.findOne({
      where: { email: dto.email },
    });
    if (exist)
      throw new BadRequestException(
        'There is already a user with this email.',
      );

    const user = new User({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      password: await bcrypt.hash(dto.password, 10),
      role: dto.role || Role.VISITANTE,
    });
    const newUser = await this._userRepository.save(user);
    return newUser;
  }

  async getOne(id: number): Promise<User | undefined> {
    const user = await this._userRepository.findOne({ where: { id } });
    if (!user) throw new BadRequestException('the user does not exist.');
    return user;
  }

  async getAll() {
    const users = await this._userRepository.find();

    return users;
  }

  async update(id: number, dto: UpdateUserReqDTO) {
    const user = await this._userRepository.findOne({ where: { id } });
    if (!user) throw new BadRequestException('The user does not exist.');

    if (dto.email) user.email = dto.email;

    if (dto.firstName) user.firstName = dto.firstName;

    if (dto.lastName) user.lastName = dto.lastName;

    if (dto.role) user.role = dto.role;

    if (dto.password) {
      const password =
        dto.password || Math.random().toString(36).substring(2, 8);
      user.password = await bcrypt.hash(password, 10);
    }

    return this._userRepository.save(new User(user));
  }

  async delete(id: number) {
    const user = await this._userRepository.findOne({ where: { id } });
    if (!user) throw new BadRequestException('the user does not exist.');

    return this._userRepository.delete(user.id);
  }

  async createAdminIfNotExist() {
    const adminUsername = this._configService.get('ADMIN_USERNAME');
    const adminPassword = this._configService.get('ADMIN_PASSWORD');

    const existingAdmin = await this._userRepository.findOne({
      where: { email: adminUsername },
    });

    if (!existingAdmin) {
      const user = new User({
        email: adminUsername,
        firstName: 'ADMINISTRADOR',
        lastName: '',
        password: await bcrypt.hash(adminPassword, 10),
        role: Role.ADMIN,
      });

      await this._userRepository.save(user);
    }
  }
}
