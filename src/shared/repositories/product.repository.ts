import { Injectable } from '@nestjs/common';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { Products } from '../schema/products';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ParsedOptions } from 'qs-to-mongo/lib/query/options-to-mongo';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Products.name) private readonly productModel: Model<Products>,
  ) {}
  async create(product: CreateProductDto) {
    const createdProduct = await this.productModel.create(product);
    return createdProduct;
  }

  async findOne(query: any) {
    const product = await this.productModel.findOne(query);
    return product;
  }

  async findProductWithGroupBy() {
    const products = await this.productModel.aggregate([
      {
        $facet: {
          latestProducts: [{ $sort: { createdAt: -1 } }, { $limit: 4 }],
          topRatedProducts: [{ $sort: { avgRating: -1 } }, { $limit: 8 }],
        },
      },
    ]);
    return products;
  }

  async find(criteria: Record<string, any>, options: ParsedOptions) {
    options.sort = options.sort || { _id: 1 };
    options.limit = options.limit || 12;
    options.skip = options.skip || 0;

    const search = criteria.search;
    delete criteria.search;

    const query: any = {};

    if (search) {
      query.$search = { text: { query: search } };
    }

    const products = await this.productModel.aggregate([
      {
        $match: { $and: [query, criteria] },
      },
      { $sort: options.sort },
      { $skip: options.skip },
      { $limit: options.limit },
    ]);

    const totalProductCount = await this.productModel.countDocuments({
      $and: [query, criteria],
    });

    return { totalProductCount, products };
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
