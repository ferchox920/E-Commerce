export class CreateMercadoPagoDto {
    items: {
        title: string;
        description: string;
        quantity: number;
        unit_price: string;
      }[];
  }
  