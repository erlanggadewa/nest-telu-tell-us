import { Controller } from '@nestjs/common';
import { AzureService } from './azure.service';

@Controller('azure')
export class AzureController {
  constructor(private readonly azureService: AzureService) {}
}
