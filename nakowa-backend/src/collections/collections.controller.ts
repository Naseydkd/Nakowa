import { Controller, Get, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { AuthGuard } from '@nestjs/passport';
import { CollectionStatus } from '@prisma/client';

@Controller('collections')
@UseGuards(AuthGuard('jwt'))
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  async findAll(@Query() filters: any) {
    return this.collectionsService.getCollections(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.collectionsService.getCollection(id);
  }

  @Patch(':id/collected')
  async markCollected(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { location?: { lat: number, lng: number } }
  ) {
    const userId = req.user.id;
    return this.collectionsService.markAsCollected(id, userId, body.location);
  }

  @Patch(':id/problem')
  async reportProblem(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { reason: string, description?: string }
  ) {
    const userId = req.user.id;
    return this.collectionsService.reportProblem(id, userId, body.reason as CollectionStatus, body.description);
  }
}
