import { IsEmail, IsOptional, MinLength, IsEnum, IsBoolean } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email?: string;

  @IsOptional()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Rôle invalide (ADMIN ou AGENT)' })
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}