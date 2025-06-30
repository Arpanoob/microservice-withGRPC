import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport, ClientProxyFactory, ClientProxy } from '@nestjs/microservices';
import { UsersModule } from './users.module';
import { firstValueFrom } from 'rxjs';

const SERVICE_NAME = 'user-service';
const SERVICE_IP = 'localhost';
const SERVICE_PORT = 3001;
const SERVICE_REGISTRY_TCP_PORT = 4000;

// Create a TCP client for Service Registry communication
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
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(UsersModule, {
      transport: Transport.TCP,
      options: { port: SERVICE_PORT },
    });

    // Create Kafka Microservice
    const kafkaMicroservice = await NestFactory.createMicroservice<MicroserviceOptions>(UsersModule, {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: ['localhost:9092'],
        },
        consumer: {
          groupId: 'user-consumer',
        },
      },
    });

    await registerService();
    
    // Start both TCP and Kafka services concurrently
    await Promise.all([app.listen(), kafkaMicroservice.listen()]);
    
    console.log(`🚀 Users Microservice (TCP) is running on port ${SERVICE_PORT}`);
    console.log(`📡 Users Microservice (Kafka) is connected to localhost:9092`);

    // Send heartbeats every 15 seconds
    setInterval(sendHeartbeat, 15000);

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await deregisterService();
      await kafkaMicroservice.close(); // Close Kafka service properly
      process.exit();
    });

    process.on('SIGTERM', async () => {
      await deregisterService();
      await kafkaMicroservice.close(); // Close Kafka service properly
      process.exit();
    });

  } catch (error) {
    console.error(`❌ Failed to start Users Microservice: ${error.message}`);
  }
}

bootstrap();
