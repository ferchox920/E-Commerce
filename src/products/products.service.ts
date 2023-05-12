import { Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductRepository } from 'src/shared/repositories/product.repository';
import { InjectStripe } from 'nestjs-stripe';
import cloudinary from 'cloudinary';
import config from 'config';
import Stripe from 'stripe';
import { Products } from 'src/shared/schema/products';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(ProductRepository) private readonly productDB: ProductRepository,

    @InjectStripe() private readonly stripeClient: Stripe,
  ) {
    cloudinary.v2.config({
      cloud_name: config.get('cloudinary.cloud_name'),
      api_key: config.get('cloudinary.api_key'),
      api_secret: config.get('cloudinary.api_secret'),
    });
  }
  async createProduct(createProductDto: CreateProductDto): Promise<{
    message: string;
    result: Products;
    success: boolean;
  }> {
    try {
      if (!createProductDto.stripeProductId) {
        const createdProductInStripe = await this.stripeClient.products.create({
          name: createProductDto.productName,
          description: createProductDto.description,
        });
        createProductDto.stripeProductId = createdProductInStripe.id;
      }

      const createdProductInDB = await this.productDB.create(createProductDto);
      return {
        message: 'Product created successfully',
        result: createdProductInDB,
        success: true,
      };
    } catch (error) {
      throw error;
    } 
  }

  async findOneProduct(id: string): Promise<{
    message: string;
    result: { product: Products; relatedProducts: Products[] };
    success: boolean;
  }> {
    try {
      const product: Products = await this.productDB.findOne({ _id: id });
      if (!product) {
        throw new Error('Product does not exist');
      }
      const relatedProducts: Products[] =
        await this.productDB.findRelatedProducts({
          category: product.category,
          _id: { $ne: id },
        });

      return {
        message: 'Product fetched successfully',
        result: { product, relatedProducts },
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }
  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
