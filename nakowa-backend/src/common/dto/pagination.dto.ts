import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { DATABASE_CONSTANTS } from '../../database/database.constants';

export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'PageSize must be an integer' })
  @Min(1, { message: 'PageSize must be at least 1' })
  @Max(DATABASE_CONSTANTS.MAX_PAGE_SIZE, { 
    message: `PageSize cannot exceed ${DATABASE_CONSTANTS.MAX_PAGE_SIZE}` 
  })
  pageSize?: number = DATABASE_CONSTANTS.DEFAULT_PAGE_SIZE;

  @IsOptional()
  search?: string;

  @IsOptional()
  sortBy?: string;

  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'asc';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}