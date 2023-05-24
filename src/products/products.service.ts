import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductRepository } from 'src/shared/repositories/product.repository';
import { InjectStripe } from 'nestjs-stripe';
import cloudinary from 'cloudinary';
import qs2m from 'qs-to-mongo';
import { unlinkSync } from 'fs';
import config from 'config';

import { Feedbackers, Products } from 'src/shared/schema/products';
import { GetProductQueryDto } from './dto/get-product-query-dto';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(ProductRepository) private readonly productDB: ProductRepository,


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
      // Check if productId already exists
      await this.productDB.checkProductIdExists(createProductDto.productId);
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
  

  async findProductById(id: string) {
    try {
      const product = await this.productDB.findById(id);

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      return {
        message: 'Product fetched successfully',
        result: product,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }
  async addFeedback(id: string, feedback: Feedbackers) {
    try {
      const product = await this.productDB.findById(id);
  
      if (!product) {
        throw new NotFoundException('Product not found');
      }
  
      product.feedbackDetails.push(feedback);
  
      await product.save();
  
      return {
        message: 'Feedback added successfully',
        result: product,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }
  

  async findAllProducts(query: GetProductQueryDto) {
    try {
      let callForHomePage = false;
      if (query.homepage) {
        callForHomePage = true;
      }
      delete query.homepage;
      const { criteria, options, links } = qs2m(query);
      if (callForHomePage) {
        const products = await this.productDB.findProductWithGroupBy();
        return {
          message:
            products.length > 0
              ? 'Products fetched successfully'
              : 'No products found',
          result: products,
          success: true,
        };
      }
      const { totalProductCount, products } = await this.productDB.find(
        criteria,
        options,
      );
      return {
        message:
          products.length > 0
            ? 'Products fetched successfully'
            : 'No products found',
        result: {
          metadata: {
            skip: options.skip || 0,
            limit: options.limit || 10,
            total: totalProductCount,
            pages: options.limit
              ? Math.ceil(totalProductCount / options.limit)
              : 1,
            links: links('/', totalProductCount),
          },
          products,
        },
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
        throw new Error('El producto no existe');
      }
      const relatedProducts: Products[] =
        await this.productDB.findRelatedProducts({
          category: product.category,
          _id: { $ne: id },
        });

      return {
        message: 'Producto recuperado exitosamente',
        result: { product, relatedProducts },
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(
    id: string,
    updateProductDto: CreateProductDto,
  ): Promise<{
    message: string;
    result: Products;
    success: boolean;
  }> {
    try {
      const productExist = await this.productDB.findOne({ _id: id });
      if (!productExist) {
        throw new Error('Product does not exist');
      }
      await this.productDB.checkProductIdExists(updateProductDto.productId);
      const updatedProduct = await this.productDB.findOneAndUpdate(
        { _id: id },
        updateProductDto,
      );
    
      return {
        message: 'Product updated successfully',
        result: updatedProduct,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  async uploadProductImage(
    id: string,
    file: any,
  ): Promise<{
    message: string;
    success: boolean;
    result: string;
  }> {
    try {
      const product = await this.productDB.findOne({ _id: id });
      if (!product) {
        throw new Error('Product does not exist');
      }
      if (product.imageDetails?.public_id) {
        await cloudinary.v2.uploader.destroy(product.imageDetails.public_id, {
          invalidate: true,
        });
      }

      const resOfCloudinary = await cloudinary.v2.uploader.upload(file.path, {
        folder: config.get('cloudinary.folderPath'),
        public_id: `${config.get('cloudinary.publicId_prefix')}${Date.now()}`,
        transformation: [
          {
            width: config.get('cloudinary.bigSize').toString().split('X')[0],
            height: config.get('cloudinary.bigSize').toString().split('X')[1],
            crop: 'fill',
          },
          { quality: 'auto' },
        ],
      });
      unlinkSync(file.path);
      await this.productDB.findOneAndUpdate(
        { _id: id },
        {
          imageDetails: resOfCloudinary,
          image: resOfCloudinary.secure_url,
        },
      );
   
    
      return {
        message: 'Image uploaded successfully',
        success: true,
        result: resOfCloudinary.secure_url,
      };
    } catch (error) {
      throw error;
    }
  }

  async modifyProductImage(
    id: string,
    file: any,
  ): Promise<{
    message: string;
    success: boolean;
    result: string;
  }> {
    try {
      const product = await this.productDB.findOne({ _id: id });
      if (!product) {
        throw new Error('Product does not exist');
      }
      if (!product.imageDetails?.public_id) {
        throw new Error('Product image does not exist');
      }

      const resOfCloudinary = await cloudinary.v2.uploader.upload(file.path, {
        folder: config.get('cloudinary.folderPath'),
        public_id: `${config.get('cloudinary.publicId_prefix')}${Date.now()}`,
        transformation: [
          {
            width: config.get('cloudinary.bigSize').toString().split('X')[0],
            height: config.get('cloudinary.bigSize').toString().split('X')[1],
            crop: 'fill',
          },
          { quality: 'auto' },
        ],
      });
      unlinkSync(file.path);
      await cloudinary.v2.uploader.destroy(product.imageDetails.public_id, {
        invalidate: true,
      });
      await this.productDB.findOneAndUpdate(
        { _id: id },
        {
          imageDetails: resOfCloudinary,
          image: resOfCloudinary.secure_url,
        },
      );

  
      return {
        message: 'Image modified successfully',
        success: true,
        result: resOfCloudinary.secure_url,
      };
    } catch (error) {
      throw error;
    }
  }

  async removeProduct(id: string): Promise<{
    message: string;
    success: boolean;
    result: null;
  }> {
    try {
      const productExist = await this.productDB.findOne({ _id: id });
      if (!productExist) {
        throw new Error('Product does not exist');
      }
      await this.productDB.findOneAndDelete({ _id: id });
   
      return {
        message: 'Product deleted successfully',
        success: true,
        result: null,
      };
    } catch (error) {
      throw error;
    }
  }
}
