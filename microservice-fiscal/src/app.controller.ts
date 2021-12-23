import { Controller, Get } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Ctx, EventPattern, MessagePattern, Payload, RmqContext, Transport } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { AppService } from './app.service';
var amqp = require('amqplib/callback_api');

const ackErrors: string[] = ['E11000']

@Controller()
export class AppController {
  
  private loremIpsum : string;
  private mockCriacoes: string[];
  private mockPedidos: string[];

  constructor(private readonly appService: AppService) {

    
    this.mockCriacoes = [];
    this.mockPedidos = [];
    this.client = this.getClientProxyLogistica();
    this.client.connect();
  }

  private client: ClientProxy;


  getClientProxyLogistica(): ClientProxy {        

      return ClientProxyFactory.create({
        transport: Transport.RMQ,
        
        options: {
          urls: [`amqp://guest:guest@127.0.0.7:5672`],
          queue: 'logistica',
          
        }
      })
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @EventPattern('criar')
    async criarJogador(@Payload() payload: string, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef()
        const originalMsg = context.getMessage()
        try {
            console.log(payload);
            this.mockCriacoes.push(payload);
            this.client.emit('criar', payload);
            await channel.ack(originalMsg)

    } catch(error) {
            console.log(`error: ${JSON.stringify(error.message)}`)
            const filterAckError = ackErrors.filter(
                ackError => error.message.includes(ackError))
    
              if (filterAckError.length > 0) {
                await channel.ack(originalMsg)
              }
        }
    }

    @EventPattern('criar-pedido')
    async criarPedido(@Payload() payload: string, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef()
        const originalMsg = context.getMessage()
        try {
            // await this.sleep(10000); 
            console.log(payload);
            this.mockPedidos.push(payload);
            await channel.ack(originalMsg)
    } catch(error) {
            console.log(`error: ${JSON.stringify(error.message)}`)
            const filterAckError = ackErrors.filter(
                ackError => error.message.includes(ackError))
    
              if (filterAckError.length > 0) {
                await channel.ack(originalMsg)
              }
        }
    }

    @MessagePattern('consultar-pedidos')
    async consultarPedidos(@Payload() _id: string, @Ctx() context: RmqContext) {
     const channel = context.getChannelRef()
     const originalMsg = context.getMessage()
     try {
      return JSON.stringify(this.mockPedidos);
     } finally {
         await channel.ack(originalMsg)
     }      
    }

    @MessagePattern('consultar')
    async consultarJogadores(@Payload() _id: string, @Ctx() context: RmqContext) {
     const channel = context.getChannelRef()
     const originalMsg = context.getMessage()
     try {
        return await this.client.send('consultar','');
     } finally {
         await channel.ack(originalMsg)
     }      
    }

    async sleep(time: number) {
      return new Promise((resolve, reject) => {
         setTimeout(resolve, time);
      });
    }

   @MessagePattern('consultar-lista')
   async consultar( @Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const originalMsg = context.getMessage()
    try {      
      let mockCriacoesLogistica = await this.client.send('consultar-lista','').toPromise();
      return JSON.stringify(this.mockCriacoes) + " <Br> Logistica: " + mockCriacoesLogistica;
    } finally {
        await channel.ack(originalMsg)
    }      
   }
}
