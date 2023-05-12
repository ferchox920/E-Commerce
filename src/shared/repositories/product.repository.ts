import { Injectable } from "@nestjs/common";
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { Products } from '../schema/products';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Products.name) private readonly productModel: Model<Products>,

  ){}
  async create(product: CreateProductDto) {
    const createdProduct = await this.productModel.create(product);
    return createdProduct;
  }

  async findOne(query: any) {
    const product = await this.productModel.findOne(query);
    return product;
  }

  
  async findRelatedProducts(query: Record<string, any>) {
    const products = await this.productModel.aggregate([
      {
        $match: query,
      },
      {
        $sample: { size: 4 },
      },
    ]);
    return products;
  }

  async findOneAndDelete(query: any) {
    const product = await this.productModel.findOneAndDelete(query);
    return product;
  }

  async findOneAndUpdate(query: any, update: any) {
    const product = await this.productModel.findOneAndUpdate(query, update, {
      new: true,
    });
    return product;
  }
}
