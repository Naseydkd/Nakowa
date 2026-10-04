import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  period: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
