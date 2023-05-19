import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import config from 'config';
import { AllExceptionFilter } from './httpExceptionFilter';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { MercadoPagoModule } from './mercado-pago/mercado-pago.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    MongooseModule.forRoot(config.get('mongoUrl'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      w: 1,
      keepAlive: true,
    }),
    UsersModule,
    ProductsModule,
    MercadoPagoModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService,{
    provide:'APP_FILTER',
    useClass: AllExceptionFilter,
  }],
})
export class AppModule {}
