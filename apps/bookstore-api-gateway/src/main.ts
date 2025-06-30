import { NestFactory } from '@nestjs/core';
import { BookstoreApiGatewayModule } from './bookstore-api-gateway.module';
import * as cookieParser from 'cookie-parser';
import { ResponseFormatMiddleware } from './middleware/response-format.middleware';
import { ResponseFormatInterceptor } from './interseptor/response.interseptor';

async function bootstrap() {
  const app = await NestFactory.create(BookstoreApiGatewayModule);

  app.use(cookieParser());  
  app.useGlobalInterceptors(new ResponseFormatInterceptor());
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
