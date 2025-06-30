import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { UsersModule } from 'apps/users/src/users.module';
import { ServiceRepositoryModule } from './service-repository.module';

async function bootstrap() {
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(ServiceRepositoryModule, {
    transport: Transport.TCP,
    options: { host: "localhost", port: 4000 },
  });
  await app.listen();
  console.log('Service Repository Microservice is running on port 4000');
}
bootstrap();
