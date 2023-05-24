import {  IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';


export enum GenderType {
  Men = 'Men',
  Women = 'Women',
  Unisex = 'Unisex'
}

export class CreateProductDto {


  @IsString()
  @IsNotEmpty()
  productId: string;
  
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsNotEmpty()
  imageDetails?: Record<string, any>;

  @IsString()
  @IsEnum(GenderType)
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  size: string;

  @IsString()
  @IsNotEmpty()
  material: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  discount: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsNumber()
  avgRating?: number;

  @IsOptional()
  @IsNotEmpty()
  highlights?: string[];

  @IsOptional()
  stripeProductId?: string;

  feedees:{
    
  }
}
