import { Module } from '@nestjs/common';
import { JsonWebTokenError, JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt-strategy';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: 'apps/users/.env',
        }),
        PassportModule,
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
    ],
    providers: [JwtStrategy,JwtService],
    exports: [JwtModule,JwtService],
})
export class AuthModule { }
