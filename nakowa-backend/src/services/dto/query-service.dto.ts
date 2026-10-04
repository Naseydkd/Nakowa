import { IsOptional, IsString, IsEnum, IsBoolean, IsNumberString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ServiceType } from './create-service.dto';

export class QueryServiceDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ServiceType)
  type?: ServiceType;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}