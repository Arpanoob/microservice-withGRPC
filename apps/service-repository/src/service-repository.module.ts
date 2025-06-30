import { Module } from '@nestjs/common';
import { ServiceRegistryController } from './service-repository.controller';
import { ServiceRegistryService } from './service-repository.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()], 
  controllers: [ServiceRegistryController],
  providers: [ServiceRegistryService],
})
export class ServiceRepositoryModule {}
