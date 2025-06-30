import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookStock, BookStockSchema } from './entities/bookstore.entities';
import { BookStockController } from './app.controller';
import { BookStockService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { redisStore } from 'cache-manager-ioredis-yet';
import { Book, BookSchema } from 'apps/books/src/entities/book.entity';


@Module({
  imports: [ConfigModule.forRoot({
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
  MongooseModule.forFeature([{ name: BookStock.name, schema: BookStockSchema },
  ])],
  controllers: [BookStockController],
  providers: [BookStockService],
})
export class BookStoreModule { }
