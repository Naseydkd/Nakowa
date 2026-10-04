import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { ServiceType } from '@prisma/client';

export { ServiceType };

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nom: string;

  @IsEnum(ServiceType)
  type: ServiceType;

  @IsNumber()
  @Min(1)
  @IsOptional()
  passages?: number; // Nombre de passages par mois

  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  prixUnitaire: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unite: string; // ex: "par fosse", "par m²", "par intervention"

  @IsNumber()
  @Min(0)
  @IsOptional()
  dureeEstimee?: number; // en minutes

  @IsString()
  @MaxLength(500)
  @IsOptional()
  materielsNecessaires?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  precautions?: string;
}
