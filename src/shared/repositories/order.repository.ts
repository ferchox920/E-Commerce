import {  Injectable } from '@nestjs/common';
import { Products } from '../schema/products';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';


@Injectable()
export class OrdersRepository {
  constructor(
    @InjectModel(Products.name) private readonly productModel: Model<Products>,
  ) {}
}