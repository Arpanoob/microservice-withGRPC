import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport, ClientProxyFactory, ClientProxy } from '@nestjs/microservices';
import { BookStoreModule } from './app.module';
import { firstValueFrom } from 'rxjs';
import { join } from 'path';

const SERVICE_NAME = 'bookstore-service';
const SERVICE_IP = 'localhost';
const SERVICE_PORT = 3003;
const SERVICE_REGISTRY_TCP_PORT = 4000;

// Create TCP client for Service Registry communication
const registryClient: ClientProxy = ClientProxyFactory.create({
  transport: Transport.TCP,
  options: { host: 'localhost', port: SERVICE_REGISTRY_TCP_PORT },
});

async function registerService() {
  try {
    console.log("🔗 Registering with Service Registry...");
    const response = await firstValueFrom(registryClient.send('register', {
      name: SERVICE_NAME,
      ip: SERVICE_IP,
      port: SERVICE_PORT,
    }));
    console.log(`✅ Registered: ${response.message}`);
  } catch (error) {
    console.error(`❌ Failed to register: ${error.message}`);
  }
}

async function sendHeartbeat() {
  try {
    console.log("💓 Sending heartbeat...");
    const response = await firstValueFrom(registryClient.send('heartbeat', { name: SERVICE_NAME }));
    console.log(response.message);
  } catch (error) {
    console.error(`❌ Heartbeat failed: ${error.message}`);
  }
}

async function deregisterService() {
  try {
    console.log("❌ Deregistering from Service Registry...");
    await firstValueFrom(registryClient.send('deregister', { name: SERVICE_NAME }));
    console.log(`✅ ${SERVICE_NAME} deregistered.`);
  } catch (error) {
    console.error(`⚠️ Deregistration failed: ${error.message}`);
  }
}

async function bootstrap() {
  try {
    // Create TCP Microservice
    const tcpMicroservice = await NestFactory.createMicroservice<MicroserviceOptions>(BookStoreModule, {
      transport: Transport.TCP,
      options: { port: SERVICE_PORT },
    });

    // Create Kafka Microservice
    const kafkaMicroservice = await NestFactory.createMicroservice<MicroserviceOptions>(BookStoreModule, {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: ['localhost:9092'],
        },
        consumer: {
          groupId: 'book-store-consumer',
        },
      },
    });
    const appp = await NestFactory.createMicroservice<MicroserviceOptions>(BookStoreModule, {
      transport: Transport.GRPC,
      options: {

        package: 'bookstock',
        protoPath: join(process.cwd(), 'apps/books/src/proto/bookstock.proto'),
        url: 'localhost:50051',
      },
    });

    await appp.listen();

    await registerService();
    await tcpMicroservice.listen();
    await kafkaMicroservice.listen();

    console.log('📡 BookStore Microservice is running on:');
    console.log(`🚀 TCP transport on port ${SERVICE_PORT}`);
    console.log('🔥 Kafka consumer listening to events');

    // Send heartbeats every 15 seconds
    setInterval(sendHeartbeat, 15000);

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await deregisterService();
      process.exit();
    });

    process.on('SIGTERM', async () => {
      await deregisterService();
      process.exit();
    });

  } catch (error) {
    console.error(`❌ Failed to start BookStore Microservice: ${error.message}`);
  }
}

bootstrap();
