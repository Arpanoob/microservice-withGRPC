import { Controller, Post, Body, Delete, Param, Get } from "@nestjs/common";
import { ServiceInfo, ServiceRegistryService } from "./service-repository.service";
import { MessagePattern, Payload } from "@nestjs/microservices";

@Controller()
export class ServiceRegistryController {
  constructor(private readonly registryService: ServiceRegistryService) { }

  @MessagePattern('heartbeat')
  heartbeat(@Payload('name') name: string) {
    console.log("heart : ", name)

    this.registryService.updateHeartbeat(name);
    return { message: `💓 Heartbeat received from ${name}` };
  }

  @MessagePattern('register')
  register(@Body() service: ServiceInfo) {
    console.log("registering : ", service)
    this.registryService.registerService(service);
    return { message: `Service ${service.name} registered successfully.` };
  }

  @Delete('deregister/:name')
  deregister(@Param('name') name: string) {
    this.registryService.deregisterService(name);
    return { message: `Service ${name} deregistered successfully.` };
  }

  @MessagePattern('registry.discover')
  async discover(@Payload() name: string) {
    console.log("opopopop", name);
    const service = this.registryService.getService(name);
    console.log("service op : ", service)
    if (!service) {
      return { error: `Service ${name} not found.` };
    }
    return service;
  }

  @MessagePattern('services')
  getAll() {
    return this.registryService.getAllServices();
  }
}