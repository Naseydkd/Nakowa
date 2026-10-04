import { IsNotEmpty, IsEmail, IsOptional, IsString, IsNumber, IsBoolean, Min, Max, Matches } from 'class-validator';
import { DATABASE_CONSTANTS } from '../../database/database.constants';

export class CreateClientDto {
  @IsNotEmpty({ message: 'Prénom requis' })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  firstName: string;

  @IsNotEmpty({ message: 'Nom requis' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  lastName: string;

  @IsOptional()
  @IsString()
  @Matches(DATABASE_CONSTANTS.PHONE_REGEX, {
    message: 'Format de téléphone invalide. Utilisez le format: +227 XX XX XX XX'
  })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  activity?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Montant doit être un nombre' })
  @Min(0, { message: 'Le montant doit être positif' })
  defaultAmount?: number = 2000;

  @IsOptional()
  @IsNumber({}, { message: 'Latitude doit être un nombre' })
  @Min(DATABASE_CONSTANTS.NIAMEY_BOUNDS.SOUTH, { message: 'Latitude hors des limites de Niamey' })
  @Max(DATABASE_CONSTANTS.NIAMEY_BOUNDS.NORTH, { message: 'Latitude hors des limites de Niamey' })
  latitude?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Longitude doit être un nombre' })
  @Min(DATABASE_CONSTANTS.NIAMEY_BOUNDS.WEST, { message: 'Longitude hors des limites de Niamey' })
  @Max(DATABASE_CONSTANTS.NIAMEY_BOUNDS.EAST, { message: 'Longitude hors des limites de Niamey' })
  longitude?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}