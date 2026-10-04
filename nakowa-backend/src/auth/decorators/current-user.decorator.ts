import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // For now, return a mock user - in production, extract from JWT
    return {
      id: 'mock-user-id',
      name: 'Mock User',
      role: 'ADMIN'
    };
  },
);