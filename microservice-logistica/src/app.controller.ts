import { Controller, Get } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { AppService } from './app.service';

const ackErrors: string[] = ['E11000']

@Controller()
export class AppController {
  
  private loremIpsum : string;
  private mockCriacoes: string[];
  private mockPedidos: string[];

  constructor(private readonly appService: AppService) {

    this.loremIpsum = `
    fsdfsklfkçlklfç
    API that all methods to be resolved. AMD. any state changes, usually by Nitobi. Yandex for example, a tool making the use of the browser based module pattern that the concept of websites employ it is an object that uses factory methods. ES is a JavaScript plugins; plugins include autoprefixer, future CSS styles using AngularJS and installing from, an application is a fast, small, and functional programming. 2D graphics within a JavaScript is that ensures that allow programs and the parent function with text, arrays, dates. Scheme. Zepto is an HTML alone cannot, such as API for dynamic web applications in environments that will eventually be such a social network programming using AMD. Chakra is the client functionality for the scripting language. Object Model DOM is a community-driven attempt at automating tedious and used by programming styles when its code can run both in a target.

    WebGL is a function while retaining their design pattern in environments that are not Web-based, such as a JavaScript interpreter that the browser-compatibility specific code can detect user to create host objects Yeoman is a language and faster JavaScript outside the browser. Nitobi. Promise is a library with first-class functions, making an application structure focusing on the server is a fast and easy DOM is a fully featured Promise library for asynchronous HTTP as an ECMAScript language used with JavaScript as API that restricts the page interaction. employ it is running, but it?s also used to represent the object that the script accordingly. Compiler is a remote server, the revealing module pattern that allow the object that ensures that gets called observers, and flexible code linter. Because JavaScript dispatches requests for library/framework free JavaScript is said to extend JavaScript developer. It?s what Chrome is an optimization used for Linked Data. Test-Driven Development.
    
    Redux is implemented in a testing framework for the require function with run-time environments that restricts the server. Promise is a utility to speed of this usage are: Loading new objects without the revealing module loader using AMD is a framework for creating objects representing HTTP requests for the require CSS styles when its elegant, well documented, and response objects, which could then interrogate and possibly complex tasks. XHR is a JavaScript was created by analogy to an XML-like syntax extension to user interfaces. Observer Pattern is a given context in a framework for many frameworks in a fast development. RxJS is a lightweight jQuery clone, without plug-ins. Knockout is a utility to implement the server is a user's reading habits and scripts to conform to various websites. Applications such as a JavaScript was created. XMLHttpRequest is a tool focusing on innovative features and JavaScript representation of JavaScript programs and respective standard defining how to various websites employ it and desktop applications. Three.
    `;
    this.mockCriacoes = [];
    this.mockPedidos = [];
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
            // await this.sleep(10000); 
            console.log(payload);
            this.mockCriacoes.push(payload);
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
        return this.loremIpsum;
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
       return JSON.stringify(this.mockCriacoes);
    } finally {
        await channel.ack(originalMsg)
    }      
   }
}
