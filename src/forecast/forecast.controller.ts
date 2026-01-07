import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { ForecastService } from '@app/forecast/forecast.service';
import { LoadModelService } from '@app/forecast/forecast.loadModel';
import { CreatModelDto } from '@app/forecast/dto/createModel.dto';

@Controller('forecast')
export class ForecastController {
  constructor(
    private readonly forecastService: ForecastService,
    private readonly loadModelService: LoadModelService,
  ) {}

  @Get('/data')
  @Header('Cache-Control', 'no-store')
  // @UseGuards(AuthGuard)
  async getInitialData() {
    return await this.forecastService.getSourceData();
  }

  // Create new model
  @Put('/model')
  @Header('Cache-Control', 'no-store')
  // @UseGuards(AuthGuard)
  async createModel(@Body('modelParams') modelParams: CreatModelDto) {
    return await this.forecastService.trainNewModel(modelParams);
  }

  // Update model
  @Post('/model')
  @Header('Cache-Control', 'no-store')
  // @UseGuards(AuthGuard)
  async reTrainModel(
    @Body() params: { id: number; modelParams: CreatModelDto }, // TODO: use UpdateModelDto
  ) {
    const { id, modelParams } = params;
    return await this.forecastService.retrainModel(id, modelParams);
  }

  @Post('/predict')
  @Header('Cache-Control', 'no-store')
  // @UseGuards(AuthGuard)
  async predict(@Body('modelId') modelId: number) {
    return this.forecastService.predict(modelId);
  }

  @Get('/trainings')
  @Header('Cache-Control', 'no-store')
  // @UseGuards(AuthGuard)
  async getModelTrainings(@Query('id') id: number) {
    return this.loadModelService.getTrainings(id);
  }
}
