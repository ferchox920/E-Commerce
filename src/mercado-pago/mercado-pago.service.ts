import { Injectable } from '@nestjs/common';
import * as mercadopago from 'mercadopago';
import config from 'config';

@Injectable()
export class MercadoPagoService {
  constructor() {
    mercadopago.configure({
      access_token: config.get('mercadopago.accessToken'),
    });
  }

  async createPreference(data: any) {
    const preference = {
      items: [
        {
          title: data.description,
          unit_price: Number(data.price),
          quantity: Number(data.quantity),
        },
      ],
      back_urls: {
        success: config.get('mercadopago.backUrls.success'),
        failure: config.get('mercadopago.backUrls.failure'),
        pending: config.get('mercadopago.backUrls.pending'),
      },
      auto_return: 'approved',
    };

    const response = await mercadopago.preferences.create(preference);

    return { id: response.body.id };
  }

  async receiveFeedback(data: any) {
    // Aquí iría el código para manejar el feedback de Mercado Pago
  }
}
