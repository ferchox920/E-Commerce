import { Body, Controller, Post } from '@nestjs/common';
import { MercadoPagoService } from './mercado-pago.service';
import { CreateMercadoPagoDto } from './dto/create-mercado-pago.dto';

@Controller('mercadopago')
export class MercadoPagoController {
  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

  @Post('create-preference')
  async createPreference(@Body() data: CreateMercadoPagoDto) {
    const preference = await this.mercadoPagoService.createPreference(data);
    console.log(preference);
    
    return preference;
  }
  
  @Post('feedback')
  async receiveFeedback(@Body() data: any) {
    await this.mercadoPagoService.receiveFeedback(data);
  }
}
