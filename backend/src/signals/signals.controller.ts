import { Body, Controller, Post } from '@nestjs/common';
import { SignalsService } from './signals.service';
import { AnalyzeSignalDto } from './dto/analyze-signal.dto';

/** Instanciação direta: tsx não emite metadata para DI do Nest. */
const signalsService = new SignalsService();

@Controller('api/v1/signals')
export class SignalsController {
  @Post('analyze')
  analyze(@Body() dto: AnalyzeSignalDto) {
    return signalsService.analyze(dto);
  }
}
