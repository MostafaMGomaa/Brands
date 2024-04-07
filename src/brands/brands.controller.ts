import { Controller, Get, Post } from '@nestjs/common';
import { BrandsService } from './brands.service';

@Controller('brands')
export class BrandsController {
  constructor(private brandsService: BrandsService) {}

  @Get()
  async findBrands() {
    return await this.brandsService.validateAndTransformData();
  }

  @Post()
  async createFakeData() {
    return await this.brandsService.genFakeData();
  }
}
