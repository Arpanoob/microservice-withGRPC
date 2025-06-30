import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

export interface ServiceInfo {
  name: string;
  ip: string;
  port: number;
  lastSeen?: number;
}
let services: Record<string, ServiceInfo> = {};

@Injectable()
export class ServiceRegistryService {
  private services: Record<string, ServiceInfo> = {};

  registerService(service: ServiceInfo) {
    services[service.name] = { ...service, lastSeen: Date.now() };
    console.log(`✅ Service registered: ${service.name} at ${service.ip}:${service.port}`);
  }

  deregisterService(name: string) {
    if (services[name]) {
      delete services[name];
      console.log(`❌ Service deregistered: ${name}`);
    }
  }

  getService(name: string): ServiceInfo | null {
    return services[name] || null;
  }

  getAllServices(): Record<string, ServiceInfo> {
    return services;
  }

  updateHeartbeat(name: string) {
    console.log(services)
    if (services[name]) {
      services[name].lastSeen = Date.now();
      console.log(`💓 Heartbeat received from: ${name}`);
    }
  }

  removeInactiveServices(timeout: number = 30000) {
    const now = Date.now();
    Object.keys(services).forEach((name) => {
      if (services[name].lastSeen && now - services[name].lastSeen > timeout) {
        console.log(`⏳ Removing inactive service: ${name}`);
        delete services[name];
      }
    });
  }

  // @Cron("*/10 * * * * *") // Run every 10 seconds
  // handleCron() {
  //   this.removeInactiveServices(30000);
  // }
}













// import { Injectable, OnModuleInit } from "@nestjs/common";
// import { Cron } from "@nestjs/schedule";


// export interface ServiceInfo {
//   name: string;
//   ip: string;
//   port: number;
//   lastSeen?: any;
// }

// @Injectable()
// export class ServiceRegistryService {
//   private services: Record<string, ServiceInfo> = {
//     "user-service": {
//       name: "user-service",
//       ip: "localhost",
//       port: 3001
//     }, "order-service": {
//       name: "order-service",
//       ip: "localhost",
//       port: 3002
//     },
//     "bookstore-service": {
//       name: "bookstore-service",
//       ip: "localhost",
//       port: 3003
//     },
//     "book-service": {
//       name: "book-service",
//       ip: "localhost",
//       port: 3004
//     }
//   };

//   registerService(service: ServiceInfo) {
//     this.services[service.name] = service;
//     console.log(`Service registered: ${service.name} at ${service.ip}:${service.port}`);
//   }

//   deregisterService(name: string) {
//     delete this.services[name];
//     console.log(`Service deregistered: ${name}`);
//   }

//   getService(name: string): ServiceInfo | null {
//     return this.services[name] || null;
//   }

//   getAllServices(): Record<string, ServiceInfo> {
//     return this.services;
//   }

//   updateHeartbeat(name: string) {
//     if (this.services[name]) {
//       this.services[name].lastSeen = Date.now();
//       console.log(`💓 Heartbeat received from: ${name}`);
//     }
//   }
//   removeInactiveServices(timeout: number = 30000) {
//     const now = Date.now();
//     Object.keys(this.services).forEach((name) => {
//       if (now - this.services[name].lastSeen > timeout) {
//         console.log(`⏳ Removing inactive service: ${name}`);
//         delete this.services[name];
//       }
//     });
//   }
//   @Cron("*/10 * * * * *") 
//   handleCron() {
//     this.removeInactiveServices(30000);
//   }
// }

