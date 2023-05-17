import { Body, Controller, Post } from '@nestjs/common';
import { MercadoPagoService } from './mercado-pago.service';

@Controller('mercadopago')
export class MercadoPagoController {
  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

  @Post('create-preference')
  async createPreference(@Body() data: any) {
    const preference = await this.mercadoPagoService.createPreference(data);
    return preference;
  }

  @Post('feedback')
  async receiveFeedback(@Body() data: any) {
    await this.mercadoPagoService.receiveFeedback(data);
  }
}
