import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Query,
  UseInterceptors,
  UploadedFile,
  Put,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Roles } from 'src/shared/middleware/role.decorators';
import { userTypes } from 'src/shared/schema/user';
import config from 'config';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetProductQueryDto } from './dto/get-product-query-dto';
import { Feedbackers } from 'src/shared/schema/products';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(201)
  @Roles(userTypes.ADMIN)
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.createProduct(createProductDto);
  }

  @Get()
  async findAll(@Query() query: GetProductQueryDto) {
    return await this.productsService.findAllProducts(query);
  }

  @Get(':productId')
  async findProductById(@Param('productId') productId: string) {
    return await this.productsService.findProductById(productId);
  }

  @Patch(':id')
  @Roles(userTypes.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: CreateProductDto,
  ) {
    return await this.productsService.updateProduct(id, updateProductDto);
  }

  @Post('/:id/image')
  @Roles(userTypes.ADMIN)
  @UseInterceptors(
    FileInterceptor('productImage', {
      dest: config.get('fileStoragePath'),
      limits: {
        fileSize: 3145728, // 3 MB
      },
    }),
  )
  async uploadProductImage(
    @Param('id') id: string,
    @UploadedFile() file: ParameterDecorator,
  ) {
    return await this.productsService.uploadProductImage(id, file);
  }

  @Post(':id/feedback')
  async addFeedback(@Param('id') id: string, @Body() feedback: Feedbackers) {
    return await this.productsService.addFeedback(id, feedback);
  }
  @Delete(':id/feedback/:feedbackId')
  @Roles(userTypes.ADMIN)
  async deleteFeedback(
    @Param('id') id: string,
    @Param('feedbackId') feedbackId: string,
  ) {
    return await this.productsService.deleteFeedback(id, feedbackId);
  }

  @Put('/:id/image')
  @Roles(userTypes.ADMIN)
  @UseInterceptors(
    FileInterceptor('productImage', {
      dest: config.get('fileStoragePath'),
      limits: {
        fileSize: 3145728, // 3 MB
      },
    }),
  )
  async modifyProductImage(
    @Param('id') id: string,
    @UploadedFile() file: ParameterDecorator,
  ) {
    return await this.productsService.modifyProductImage(id, file);
  }

  @Delete(':id')
  @Roles(userTypes.ADMIN)
  async remove(@Param('id') id: string) {
    return await this.productsService.removeProduct(id);
  }
}
