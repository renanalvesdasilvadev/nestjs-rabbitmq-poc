import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices'
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'
import * as momentTimezone from 'moment-timezone'

const logger = new Logger('Main')
const configService = new ConfigService()

async function bootstrap() {
  console.log(configService.get<string>('RABBITMQ_URL'));
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://guest:guest@127.0.0.7:5672`],    
      noAck: false,
      queue: 'financeiro',
      prefetchCount: 3,
      isGlobalPrefetchCount: true,
      queueOptions: {
          durable: true
      }
    },
  });

  Date.prototype.toJSON = function(): any {
    return momentTimezone(this)
      .tz("America/Sao_Paulo")
      .format("YYYY-MM-DD HH:mm:ss.SSS")
  }

  await app.listen(() => logger.log('Microservice is listening'));
}
bootstrap();
