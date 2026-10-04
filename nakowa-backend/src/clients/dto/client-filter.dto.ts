import { IsOptional, IsEnum, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export enum ClientSortBy {
  CREATED_AT = 'createdAt',
  FIRST_NAME = 'firstName',
  LAST_NAME = 'lastName',
  ADDRESS = 'address',
  PHONE = 'phone',
  EMAIL = 'email',
}

export enum ClientStatus {
  ALL = 'all',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class ClientFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus = ClientStatus.ACTIVE;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  hasLocation?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  hasPhone?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  hasEmail?: boolean;

  @IsOptional()
  @IsEnum(ClientSortBy)
  sortBy?: ClientSortBy = ClientSortBy.CREATED_AT;
}