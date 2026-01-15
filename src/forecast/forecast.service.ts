import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult, DataSource, IsNull, Not, In } from 'typeorm';
import { SaveModelService } from '@app/forecast/forecast.saveModel';
import { LoadModelService } from '@app/forecast/forecast.loadModel';
import { TF_trainingEntity } from '@app/forecast/entities/tf_training.entity';
import { TFModel_Entity } from '@app/forecast/entities/tf_model.entity';
import { AverageTemperatureEntity } from '@app/forecast/entities/average_temperature.entity';
import { TrainingService } from '@app/forecast/forecast.training';
import { CreatModelDto } from '@app/forecast/dto/createModel.dto';
import { PredictService } from '@app/forecast/forecast.predict';
import { CityEntity } from '@app/forecast/entities/city.entity';

// TODO: NeedCheck dispose model
@Injectable()
export class ForecastService {
  constructor(
    private readonly dataSource: DataSource,
    // Repo
    @InjectRepository(AverageTemperatureEntity)
    private readonly averageTemperatureRepository: Repository<AverageTemperatureEntity>,
    @InjectRepository(TF_trainingEntity)
    private readonly trainingRepository: Repository<TF_trainingEntity>,
    @InjectRepository(CityEntity)
    private readonly cityRepository: Repository<CityEntity>,
    // Services
    private readonly saveModel: SaveModelService,
    private readonly loadModel: LoadModelService,
    private readonly trainingModel: TrainingService,
    private readonly predictService: PredictService,
  ) {}

  async getCityById(cityId: number): Promise<CityEntity> {
    return await this.cityRepository.findOne({ where: { id: cityId } });
  }

  private buildModelResponse({
    id,
    model_name,
    batchSize,
    epochs,
    description,
  }: TFModel_Entity): Partial<TFModel_Entity> {
    return {
      id,
      model_name,
      batchSize,
      epochs,
      description,
    };
  }

  // async function getPartialTemperatures(): Promise<Partial<AverageTemperatureEntity>[]> {
  // TODO: needs to be typified
  // TODO: NeedUpdate by Training/Predict
  private async getSeasonsData(modelParams?: CreatModelDto): Promise<any> {
    const filterParams: any = {
      temp: Not(IsNull()),
    };

    if (modelParams?.trainingPeriod?.length) {
      filterParams.month = In([...modelParams.trainingPeriod]);
    }

    const data: AverageTemperatureEntity[] =
      await this.averageTemperatureRepository.find({
        where: {
          ...filterParams,
        },
      });
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

    // TODO: Convert data without Number()
    // TODO: Fix AverageTemperatureEntity
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
      const dataSet = await this.getSeasonsData(modelParams);
      const trainedModel = await this.trainingModel.trainNewModel(
        modelParams,
        dataSet,
      );

      const { trainingLog, savedModel } = trainedModel;
      return { trainingLog, model: this.buildModelResponse(savedModel) };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Error with training model',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async retrainModel(id: number, modelParams: CreatModelDto) {
    try {
      const dataSet = await this.getSeasonsData(modelParams);
      const sourceModel = await this.loadModel.getModelById(id);
      const reTrainedModel = await this.trainingModel.retrainModel(
        id,
        modelParams,
        dataSet,
        sourceModel,
      );

      const { trainingLog, model } = reTrainedModel;
      return { trainingLog, model: this.buildModelResponse(model) };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Error with retraining model',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //TODO: fix: convert(cityId: number, modelId: number, nextYearMonths: number[]) to dto
  async predict(cityId: number, modelId: number, nextYearMonths: number[]) {
    try {
      const city: CityEntity = await this.getCityById(cityId);
      const model = await this.loadModel.loadModelFromPostgreSQL(modelId);
      const originalData = await this.getSeasonsData();

      // TODO: move to Controller as request
      // const nextYearMonths = [
      //   37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
      // ]; // Default

      await this.predictService.predictData(
        city,
        model,
        originalData,
        nextYearMonths,
      );
      return 'ok';
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
