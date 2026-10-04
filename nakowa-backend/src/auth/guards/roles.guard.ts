import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Simplified version - always allow for now
    // In production, implement proper role validation
    return true;
  }
}