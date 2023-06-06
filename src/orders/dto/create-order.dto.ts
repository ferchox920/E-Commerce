export class CreateOrderDto {
    orderId: string;
    userId: string;
    customerAddress: {
      line1: string;
      line2: string;
      city: string;
      state: string;
      country: string;
      postal_code: string;
    };
    customerPhoneNumber: string;
    orderedItems: OrderedItemDto[];
  }
  
  
  export class OrderedItemDto {
    productId: string;
    quantity: number;
    price: number;
    lifetime: boolean;
    validity: number;
    productName: string;
  }
  