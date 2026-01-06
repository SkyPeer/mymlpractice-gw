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
    // const data = await this.forecastService.getSeasonsData();
    // console.log('data', data);
    return await this.forecastService.getSourceData();
  }

  @Get('/train')
  @Header('Cache-Control', 'no-store')
  // @UseGuards(AuthGuard)
  async trainModel(@Body('modelId') modelId: number) {
    // return this.forecastService.trainModel(modelName);
    return modelId;
  }

  @Post('/model')
  @Header('Cache-Control', 'no-store')
  // @UseGuards(AuthGuard)
  async createModel(@Body('modelParams') modelParams: CreatModelDto) {
    return await this.forecastService.createNewModel(modelParams);
  }

  @Post('/retrain')
  @Header('Cache-Control', 'no-store')
  // @UseGuards(AuthGuard)
  async reTrainModel(@Body('id') id: number) {
    return this.forecastService.retrainModel(id);
  }

  @Get('/predict')
  @Header('Cache-Control', 'no-store')
  // @UseGuards(AuthGuard)
  async predict(modelId) {
    return this.forecastService.predict(modelId);
  }

  @Get('/model')
  @Header('Cache-Control', 'no-store')
  // @UseGuards(AuthGuard)
  async model() {
    return this.loadModelService.getTrainings();
  }
}
