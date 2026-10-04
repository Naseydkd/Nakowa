import { Type } from 'class-transformer';
import { CollectionStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

export class CollectionQueryDto {
  @IsOptional() @IsString() date?: string;
  @IsOptional() @IsString() agent?: string;
  @IsOptional() @IsEnum(CollectionStatus) status?: CollectionStatus;
  @IsOptional() @Type(() => Number) @Min(1) @Max(2) passage?: number;
  @IsOptional() @Type(() => Number) @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @Min(1) @Max(100) limit?: number = 20;
}

export class LocationDto {
  @Type(() => Number) latitude: number;
  @Type(() => Number) longitude: number;
}

export class MarkCollectedDto {
  @IsOptional() @ValidateNested() @Type(() => LocationDto)
  location?: LocationDto;
}

export class ReportProblemDto {
  @IsEnum(CollectionStatus)
  status: CollectionStatus;

  @IsString()
  reason: string;

  @IsOptional() @IsString()
  description?: string;
}
