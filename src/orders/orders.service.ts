import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectStripe } from 'nestjs-stripe';
import { OrdersRepository } from 'src/shared/repositories/order.repository';
import { ProductRepository } from 'src/shared/repositories/product.repository';
import { UserRepository } from 'src/shared/repositories/user.repository';

import config from 'config';

import { userTypes } from 'src/shared/schema/user';
import { sendEmail } from 'src/shared/utility/mail-handler';

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
      if (orderExists) return {
        success: false,
        result: orderExists,
        message: 'The order exists',
      };
      const result = await this.orderDB.create(createOrderDto);
      return  {
        success: true,
        result: result,
        message: 'Created successfully',
      };;
    } catch (error) {
      throw error;
    }
  }

  async findAll(status: string, user: Record<string, any>) {
    try {
      const userDetails = await this.userDB.findOne({
        _id: user._id.toString(),
      });
      const query = {} as Record<string, any>;
      if (userDetails.type === userTypes.CUSTOMER) {
        query.userId = user._id.toString();
      }
      if (status) {
        query.status = status;
      }
      const orders = await this.orderDB.findOne(query);
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
      'Order Success ',
      {
        orderId,
        orderLink,
      },
    );
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

  async completeOrder(orderId: string) {
    try {
      const order = await this.orderDB.findOne({ _id: orderId });

      if (!order) {
        throw new BadRequestException('Order not found');
      }

      if (order.orderStatus === 'completed') {
        throw new BadRequestException('Order is already completed');
      }

      order.orderStatus
      // Update the order status in the database
      await order.save();

      // Update the product stock
      for (const item of order.orderedItems) {
        const product = await this.productDB.findOne({ productId: item.productId });

        if (!product) {
          throw new BadRequestException(`Product with ID ${item.productId} not found`);
        }

        product.stock -= item.quantity;

        // Update the product stock in the database
        await product.save();
      }

      return {
        success: true,
        message: 'Order completed successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}
