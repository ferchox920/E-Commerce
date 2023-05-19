import config from 'config';
import { AuthMiddleware } from 'src/shared/middleware/auth';
import { RolesGuard } from 'src/shared/middleware/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { UserRepository } from 'src/shared/repositories/user.repository';
import { ProductRepository } from 'src/shared/repositories/product.repository';
import { OrdersRepository } from 'src/shared/repositories/order.repository';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

@Module({
  controllers: [OrdersController],
  providers: [
    OrdersService,
    UserRepository,
    ProductRepository,
    OrdersRepository,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],

})
export class OrdersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({
        path: `${config.get('appPrefix')}/orders`,
        method: RequestMethod.POST,
      })
      .forRoutes(OrdersController);
  }
}