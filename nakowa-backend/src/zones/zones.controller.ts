import { Controller, Get } from '@nestjs/common';

@Controller('zones')
export class ZonesController {
  @Get()
  getZones() {
    return {
      data: [
        'Yantala',
        'Plateau',
        'Koira Kano',
        'Koira Tegui',
        'Nouveau Marché',
        'Terminus',
        'Lazaret',
        'Kouara Kano',
        'Lamordé',
        'Gamkalley',
      ],
    };
  }
}
