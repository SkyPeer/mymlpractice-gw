import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult, DataSource } from 'typeorm';
import { SaveModelService } from '@app/forecast/forecast.saveModel';
import { LoadModelService } from '@app/forecast/forecast.loadModel';
import { TF_trainingEntity } from '@app/forecast/entities/tf_training.entity';
import { TFModel_Entity } from '@app/forecast/entities/tf_model.entity';
import { AverageTemperatureEntity } from '@app/forecast/entities/average_temperature.entity';
import { TrainingService } from '@app/forecast/forecast.training';
import { CreatModelDto } from '@app/forecast/dto/createModel.dto';
import { PredictService } from '@app/forecast/forecast.predict';

// TODO: NeedCheck dispose model
@Injectable()
export class ForecastService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(AverageTemperatureEntity)
    private readonly averageTemperatureRepository: Repository<AverageTemperatureEntity>,
    @InjectRepository(TF_trainingEntity)
    private readonly trainingRepository: Repository<TF_trainingEntity>,
    private readonly saveModel: SaveModelService,
    private readonly loadModel: LoadModelService,
    private readonly trainingModel: TrainingService,
    @InjectRepository(TFModel_Entity)
    private readonly predictService: PredictService,
  ) {}

  // async function getPartialTemperatures(): Promise<Partial<AverageTemperatureEntity>[]> {
  private async getSeasonsData(): Promise<any> {
    // TODO: NeedUpdate by Training/Predict
    const data = await this.averageTemperatureRepository.find();
    const months = data.map((item) => Number(item.month));
    const predicts = [];
    const trainings = [];
    const temps = [];

    data.forEach((item) => {
      if (item.temp) {
        // temps.push({ x: Number(item.month), y: Number(item.temp) });
        temps.push(Number(item.temp));

        if (item.predict) {
          trainings.push(Number(item.predict));
        }
      } else {
        // predicts.push({ x: Number(item.month), y: Number(item.predict) });
        predicts.push(Number(item.predict));
      }
    });

    return {
      months,
      predicts,
      trainings,
      temps,
    };
  }

  // private async getAverageTemperatureData(): Promise<AverageTemperatureEntity[]> {
  //   return await this.averageTemperatureRepository.find();
  // }

  async getSourceData(): Promise<any> {
    const data = await this.averageTemperatureRepository.find({
      order: { month: 'ASC' },
    });

    // TODO: Max/Min settings for chart
    // const chartSettings = {max: 25, min:10}

    // TODO: Convert data by orm
    return data.map((item: any) => ({
      id: Number(item.id),
      temp: item.temp ? Number(item.temp) : null,
      month: item.month ? Number(item.month) : null,
      predict: item.predict ? Number(item.predict) : null,
      train: item.train ? Number(item.train) : null,
    }));
  }

  async trainNewModel(modelParams: CreatModelDto) {
    try {
      const dataSet = await this.getSeasonsData();
      const trainedModel = await this.trainingModel.trainNewModel(
        modelParams,
        dataSet,
      );

      const { trainingLog } = trainedModel;
      return { trainingLog };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Error creating model',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async retrainModel(id: number, modelParams: CreatModelDto) {
    try {
      const dataSet = await this.getSeasonsData();
      const sourceModel = this.loadModel.getModelById(id);
      const trainedModel = await this.trainingModel.retrainModel(
        id,
        modelParams,
        dataSet,
        sourceModel,
      );

      const { trainingLog } = trainedModel;
      return { trainingLog };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Error creating model',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async predict(modelId: number) {
    try {
      const model = await this.loadModel.loadModelFromPostgreSQL(modelId);
      const originalData = await this.getSeasonsData();

      // TODO: move to Controller as request
      const nextYearMonths = [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48];

      return await this.predictService.predictData(
        model,
        originalData,
        nextYearMonths,
      );
    } catch (err) {
      if (err.response && err.status) {
        throw new HttpException(err.response, err.status);
      }
      const error = new Error(err);
      throw new HttpException(
        error.toString(),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
