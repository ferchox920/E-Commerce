import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })

export class Feedbackers extends Document {
  @Prop({})
  customerId: string;

  @Prop({})
  customerName: string;

  @Prop({})
  rating: number;

  @Prop({})
  feedbackMsg: string;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedbackers);

@Schema({ timestamps: true })
export class Products extends Document{

  @Prop({ required: true, unique: true })
  productId: string;
  

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    default:
      'https://us.123rf.com/450wm/pavelstasevich/pavelstasevich1811/pavelstasevich181101027/112815900-no-image-available-icon-flat-vector.jpg?ver=6',
  })
  image?: string;

  @Prop({
    required: true,
    enum: ['Men', 'Women', 'Unisex'],
  })
  gender: string;

  @Prop({ required: true })
  brand: string;
 
  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  color: string;

  @Prop({ required: true })
  size: string;

  @Prop({ required: true })
  material: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  discount: number;

  @Prop({ required: true })
  stock: number;

  @Prop({})
  avgRating: number;

  @Prop([{ type: FeedbackSchema }])
  feedbackDetails: Feedbackers[];

  @Prop({type: Object})
  imageDetails: Record<string, any>;

  @Prop({})
  highlights: string[];

}
export const ProductSchema = SchemaFactory.createForClass(Products);
