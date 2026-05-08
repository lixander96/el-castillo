import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Expose } from 'class-transformer';

export enum Role {
    ADMIN = 'ADMIN',
    CLIENTE = 'CLIENTE',
    ARTISTA = 'ARTISTA',
    VISITANTE ='VISITANTE',
    ACCESO = 'ACCESO',
    OPERACIONES ='OPERACIONES',
    PROMOTOR = 'PROMOTOR'
}

@Entity()
export class User extends BaseEntity {
    constructor(partial?: Partial<User>) {
        super()
        partial && Object.assign(this, partial)
    }

    @PrimaryGeneratedColumn()
    @Expose()
    id: number;
    
    @Column({length: 64})
    @Expose()
    email: string;
    
    @Column({length: 64})
    @Expose()
    firstName: string;
    
    @Column({length: 64})
    @Expose()
    lastName: string;
    
    @Column()
    @Expose({toClassOnly: true})
    password: string;
    
    @Column({ type: 'enum', enum: Role})
    @Expose()
    role: Role;

    @Column({ length: 32, nullable: true })
    @Expose()
    oauthProvider?: string | null;

    @Column({ length: 255, nullable: true })
    oauthProviderId?: string | null;

    @Column({ type: 'text', nullable: true })
    @Expose()
    avatar?: string | null;
}
