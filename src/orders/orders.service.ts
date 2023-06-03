import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { OrdersRepository } from 'src/shared/repositories/order.repository';
import { ProductRepository } from 'src/shared/repositories/product.repository';
import { UserRepository } from 'src/shared/repositories/user.repository'

import config from 'config';

import { userTypes } from 'src/shared/schema/user';
import { sendEmail } from 'src/shared/utility/mail-handler';
import { orderStatus } from 'src/shared/schema/orders';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(OrdersRepository) private readonly orderDB: OrdersRepository,
    @Inject(ProductRepository) private readonly productDB: ProductRepository,
    @Inject(UserRepository) private readonly userDB: UserRepository,
  ) {}

  async create(createOrderDto: Record<string, any>) {
    try {
      const orderExists = await this.orderDB.findOne({
        checkoutSessionId: createOrderDto.checkoutSessionId,
      });

      if (orderExists) {
        return orderExists;
      }

      const result = await this.orderDB.create(createOrderDto);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async findAll(status: string, user: Record<string, any>) {
    try {
      const userDetails = await this.userDB.findOne({
        _id: user._id.toString(),
      });

      const query: Record<string, any> = {};

      if (userDetails.type === userTypes.CUSTOMER) {
        query.userId = user._id.toString();
      }

      if (status) {
        query.status = status;
      }

      const orders = await this.orderDB.find(query);

      return {
        success: true,
        result: orders,
        message: 'Orders fetched successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async sendOrderEmail(email: string, orderId: string, orderLink: string) {
    await sendEmail(
      email,
      config.get('emailTemplates.orderSuccess'),
      'Order Success',
      {
        orderId,
        orderLink,
      },
    );
  }

  async markOrderAsCompleted(orderId: string) {
    try {
      const order = await this.orderDB.findOne({ _id: orderId });
  
      if (!order) {
        throw new BadRequestException('Order not found');
      }
  
      if (order.orderStatus === orderStatus.completed) {
        throw new BadRequestException('Order already marked as completed');
      }
  
      order.orderStatus = orderStatus.completed;
      await order.save();
  
      // Actualizar el stock de los productos en la orden
      for (const item of order.orderedItems) {
        const product = await this.productDB.findOne({ productId: item.productId });
  
        if (!product) {
          throw new BadRequestException(`Product with ID ${item.productId} not found`);
        }
  
        if (item.quantity > product.stock) {
          throw new BadRequestException(`Insufficient stock for product with ID ${item.productId}`);
        }
  
        product.stock -= item.quantity;
        await product.save();
      }
  
      return {
        success: true,
        message: 'Order marked as completed',
      };
    } catch (error) {
      throw error;
    }
  }
  

  async findOne(id: string) {
    try {
      const result = await this.orderDB.findOne({ _id: id });

      return {
        success: true,
        result,
        message: 'Order fetched successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  // Otros métodos y funcionalidades relacionadas con el servicio "OrdersService"
}
