import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { AppService } from './app.service';
import {timeout} from 'rxjs/operators';
import {PayloadTeste} from './payload-teste';
import { EventEmitter } from 'stream';
var amqp = require('amqplib/callback_api');

@Controller()
export class AppController {

  private client: ClientProxy;
  private clientLogistica: ClientProxy;
  private eventEmitter : EventEmitter;
  constructor(private readonly appService: AppService) {
    this.eventEmitter = new EventEmitter();
    this.client = this.getClientProxyFinanceiro();
    this.client.connect();
    this.clientLogistica = this.getClientProxyLogistica();
    this.clientLogistica.connect();
    this.initializeExchange('teste', this.eventEmitter);
  }

  initializeExchange(ex: string, eventEmitter: EventEmitter) {
    amqp.connect('amqp://guest:guest@127.0.0.7:5672', function (err, conn) { 
          
      conn.createChannel(function (err, ch) {            

          ch.assertExchange(ex, 'fanout');
          
          eventEmitter.on('publish', (message) => {
            let buf = Buffer.from(message, 'utf-8');
            ch.publish(ex, '', buf);
            console.log(" [x] Sent %s", message);
          });          
          
      });      
  })
  }

  getClientProxyFinanceiro(): ClientProxy {        

    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://guest:guest@127.0.0.7:5672`],
        queue: 'financeiro'
      }
    })
}

getClientProxyLogistica(): ClientProxy {        

  return ClientProxyFactory.create({
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://guest:guest@127.0.0.7:5672`],
      queue: 'logistica'
    }
  })
}


@Post("criar")
criar(@Body() payload: PayloadTeste) {
  console.log(payload);
  this.client.emit('criar', payload);
}

@Post("criar-pedido")
  criarPedido(@Body() payload: PayloadTeste) {
    console.log(payload);
    let message = {
      "pattern": "criar-pedido",
      "data": payload
    }
    console.log(message);
    this.eventEmitter.emit('publish', JSON.stringify(message));
  }


  @Get("consultar")
  consultarCategorias(): Observable<any> {

    return this.client.send('consultar', '')

  }

  @Get("consultar-lista")
  async consultar(){

    let listaFinanceiro = await this.client.send('consultar-lista', '').pipe(timeout(10000)).toPromise();

    return [listaFinanceiro];

  }

  @Get("consultar-pedidos")
  async consultarPedidos(){

    let listaFinanceiro = await this.client.send('consultar-pedidos', '').pipe(timeout(10000)).toPromise();
    let listaLogistica = await this.clientLogistica.send('consultar-pedidos', '').pipe(timeout(10000)).toPromise();

    return [listaFinanceiro, listaLogistica];

  }

  
  
}
