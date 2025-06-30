import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class BookstoreApiGatewayService {
  constructor(@Inject('SERVICE_REGISTRY') private readonly serviceRegistry: ClientProxy) { }

  getHello(): string {
    return 'Hello World!';
  }

  async forwardRequest(serviceName: string, path: string, method: string, data?: any) {
    console.log("Pattern : ",path,data)

    const pattern = this.pathToPattern(path)
    console.log("Pattern : ",pattern,data)
    const client = await this.getClientProxy(serviceName);
    try {
      return {data:await lastValueFrom(client.send(pattern, data))}
    } catch (error) {
      throw new Error(`Error forwarding request: ${error.message}`);
    }
  }

  pathToPattern(str: string): string {
    if (str.startsWith('/')) {
      str = str.slice(1);
    }
    return str.replace(/\//g, '.');
  }

  async getClientProxy(serviceName: string): Promise<ClientProxy> {
    const service = await lastValueFrom(this.serviceRegistry.send("registry.discover", serviceName));
    if (!service) {
      throw new Error(`Service ${serviceName} not found.`);
    }

    console.log(`Creating new ClientProxy for ${serviceName} at ${service.ip}:${service.port}`);

    const client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: service.ip,
        port: service.port,
      },
    });

    return client;
  }
}

      // async forwardRequest(serviceName: string, path: string, method: string, data?: any) {
      //   console.log("000000hihih", serviceName)
      //   try {
      //     const service = await lastValueFrom(this.serviceRegistry.send("registry.discover", serviceName));
      //     console.log("hihi0000000000h", service)
    
      //     if (!service) {
      //       throw new Error(`Service ${serviceName} not found.`);
      //     }
      //     const url = `http://${service.ip}:${service.port}/${path}`;
      //     console.log(`Forwarding request to ${url}`);
      //     try {
      //       switch (method) {
      //         case 'GET':
      //           return (await axios.get(url, { params: data })).data;
      //         case 'POST':
      //           return (await axios.post(url, data)).data;
      //         case 'DELETE':
      //           return (await axios.delete(url)).data;
      //         default:
      //           throw new Error(`Unsupported method: ${method}`);
      //       }
      //     } catch (error) {
      //       throw new Error(`Error forwarding request: ${error.message}`);
      //     }
      //   } catch (e) {
      //     console.error(e)
      //   }
      // }