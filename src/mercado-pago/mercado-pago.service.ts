import { Injectable } from '@nestjs/common';
import * as mercadopago from 'mercadopago';
import config from 'config';
import { CreateMercadoPagoDto } from './dto/create-mercado-pago.dto';

@Injectable()
export class MercadoPagoService {
  constructor() {
    mercadopago.configure({
      access_token: config.get('mercadopago.accessToken'),
    });
  }
  async createPreference(data: CreateMercadoPagoDto) {
    try {
      const items = data.items.map(item => {
        return {
          title: item.title,
          description: item.description,
          quantity: item.quantity,
          currency_id: "ARS",
          unit_price: parseFloat(item.unit_price),
        }
      });
  
      const preference = {
        items,
        back_urls: {
          success: config.get('mercadopago.backUrls.success'),
          failure: config.get('mercadopago.backUrls.failure'),
          pending: config.get('mercadopago.backUrls.pending'),
        },
        auto_return: 'approved',
      };
  
      const response = await mercadopago.preferences.create(preference);
  
      return response.body.init_point;
    } catch (error) {
      console.log(error);
      throw new Error('Error creating MercadoPago preference');
    }
  }
  

  async receiveFeedback(data: any) {
    // Aquí iría el código para manejar el feedback de Mercado Pago
  }
}
