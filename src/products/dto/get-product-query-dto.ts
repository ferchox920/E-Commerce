import { IsString, IsEnum, IsOptional, IsInt } from 'class-validator';

export class GetProductQueryDto {
    
    homepage?: string;

    @IsString()
    @IsOptional()
    search?: string;
  
    @IsEnum(['Men', 'Women', 'Unisex'])
    @IsOptional()
    gender?: string;
  
    @IsString()
    @IsOptional()
    brand?: string;
  
    @IsString()
    @IsOptional()
    category?: string;
  
    @IsString()
    @IsOptional()
    color?: string;
  
    @IsString()
    @IsOptional()
    size?: string;
  
    @IsString()
    @IsOptional()
    material?: string;
  
    @IsInt()
    @IsOptional()
    limit?: number;
  
    @IsInt()
    @IsOptional()
    skip?: number;
  }
  