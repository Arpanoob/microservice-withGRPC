import { Module } from '@nestjs/common';
import { BookstoreApiGatewayController } from './bookstore-api-gateway.controller';
import { BookstoreApiGatewayService } from './bookstore-api-gateway.service';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'SERVICE_REGISTRY',
        transport: Transport.TCP,
        options: { host: 'localhost', port: 4000 },
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log("secrests : ", configService.get<string>('JWT_SECRET'),)
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: '1h' },
        }
      },
    }),

    AuthModule,
  ],
  controllers: [BookstoreApiGatewayController],
  providers: [BookstoreApiGatewayService],
})
export class BookstoreApiGatewayModule { }
