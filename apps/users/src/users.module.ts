import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { User, UserSchema } from './entities/user.entities';
import { console } from 'inspector';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';
import { createKeyv } from '@keyv/redis';
import { redisStore } from 'cache-manager-ioredis-yet';


@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/users/.env',
    }),
    CacheModule.register({
      store: redisStore,
      host: 'localhost', 
      port: 6379,
      ttl: 600, 
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const mongoUri = configService.get<string>('MONGODB_URI');
        console.log('🚀 MONGODB_URI:', mongoUri); // ✅ Debug log
        if (!mongoUri) throw new Error('❌ MONGODB_URI is undefined!' + process.env.MONGODB_URI);
        return { uri: mongoUri };
      }

    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule { }
