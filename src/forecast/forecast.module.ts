import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { ForecastService } from '@app/forecast/forecast.service';
import { ForecastController } from '@app/forecast/forecast.controller';
import { TrainingService } from '@app/forecast/forecast.training';
import { SaveModelService } from '@app/forecast/forecast.saveModel';
import { LoadModelService } from '@app/forecast/forecast.loadModel';
import { TFModel_Entity } from '@app/forecast/entities/tf_model.entity';
import { TF_trainingEntity } from '@app/forecast/entities/tf_training.entity';
import { AverageTemperatureEntity } from '@app/forecast/entities/average_temperature.entity';
import { PredictService } from '@app/forecast/forecast.predict';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      TFModel_Entity,
      TF_trainingEntity,
      AverageTemperatureEntity,
    ]),
  ],
  controllers: [ForecastController],
  providers: [
    ForecastService,
    TrainingService,
    SaveModelService,
    LoadModelService,
    PredictService,
  ],
  exports: [
    ForecastService,
    TrainingService,
    SaveModelService,
    LoadModelService,
    PredictService,
  ],
})
export class ForecastModule {}
