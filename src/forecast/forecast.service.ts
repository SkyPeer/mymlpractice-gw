import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult, DataSource } from 'typeorm';
import * as tf from '@tensorflow/tfjs-node';
//import { TrainingService } from '@app/forecast/forecast.training.service';
import { SaveModelService } from '@app/forecast/forecast.saveModel';
import { LoadModelService } from '@app/forecast/forecast.loadModel';
import { TF_trainingEntity } from '@app/forecast/entities/tf_training.entity';
import { TFModel_Entity } from '@app/forecast/entities/tf_model.entity';
import { AverageTemperatureEntity } from '@app/forecast/entities/average_temperature.entity';
import { TrainingService } from '@app/forecast/forecast.training';
import { CreatModelDto } from '@app/forecast/dto/createModel.dto';

// TODO: NeedCheck dispose model

// // CreateModel
// function createModel() {
//   const model = tf.sequential({
//     layers: [
//       tf.layers.dense({ inputShape: [3], units: 8, activation: 'relu' }),
//       tf.layers.dense({ units: 1 }),
//     ],
//   });
//   model.compile({
//     optimizer: tf.train.adam(0.01),
//     loss: 'meanSquaredError',
//   });
//   return model;
// }

// Helper function to create seasonal features
function createFeatures(monthNumbers: number[]) {
  console.log('\n=== createFeatures === START === ');
  const features = [];

  for (const month of monthNumbers) {
    // Get the month within year (1-12)
    const monthInYear = ((month - 1) % 12) + 1;

    // Create seasonal features using sine and cosine
    // This captures the cyclical nature of seasons
    const angle = (2 * Math.PI * monthInYear) / 12;
    const sinSeason = Math.sin(angle);
    const cosSeason = Math.cos(angle);

    // Also include a trend component (normalized month number)
    const trend = month / 36; // Normalize to 0-1 range

    features.push([sinSeason, cosSeason, trend]);
  }

  return features;
}

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
    private readonly modelRepository: Repository<TFModel_Entity>,
  ) {}

  private async getModel(id: number): Promise<TFModel_Entity> {
    return await this.modelRepository.findOne({ where: { id: Number(id) } });
  }

  // async function getPartialTemperatures(): Promise<Partial<AverageTemperatureEntity>[]> {
  async getSeasonsData(): Promise<any> {
    // TODO: NeedUpdate by Training/Predict
    const data = await this.averageTemperatureRepository.find();

    console.log('getSeasonsData  data', data);

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

    // const lastTraining = trainings[trainings.length - 1];
    // predicts.unshift(lastTraining);

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

  // async retrainModel(id: number) {
  //   console.log('\n=== trainModel === START === ');
  //
  //   try {
  //     const dataSet = await this.getSourceData();
  //     const trainMonths = dataSet.months;
  //     const trainTemperatures = dataSet.temps;
  //
  //     console.log('trainMonths', trainMonths);
  //     console.log('trainTemperatures', trainTemperatures);
  //
  //     console.log('Creating model with seasonal features...');
  //     const model = createModel();
  //
  //     const trainingLog: any[] = [];
  //
  //     // Create features with seasonal patterns
  //     const trainFeatures = createFeatures(trainMonths);
  //     const xData = tf.tensor2d(trainFeatures);
  //     const yData = tf.tensor2d(trainTemperatures, [
  //       trainTemperatures.length,
  //       1,
  //     ]);
  //
  //     // Train the model
  //     console.log('Training model...');
  //     await model.fit(xData, yData, {
  //       epochs: 200, // 200  //TODO: config! Default 200
  //       batchSize: 12, // 12 //TODO: config! Default 12
  //       callbacks: {
  //         onEpochEnd: (epoch: number, logs: any) => {
  //           console.log('epoch:', epoch, ' - Log:', logs.loss);
  //           trainingLog.push({ epoch, loss: logs.loss });
  //           if (epoch % 50 === 0) {
  //             //console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
  //           }
  //         },
  //       },
  //     });
  //
  //     //await saveModelToPostgreSQL(model, 'newModel', trainMonthsX, trainY);
  //
  //     // ============================================
  //     // Save ReTrainedModel
  //     // ============================================
  //     // const savedModel = await this.saveModel.updateModelToPostgreSQL(
  //     //   id,
  //     //   model,
  //     // );
  //
  //     // ============================================
  //     // Update TrainingLog
  //     // ============================================
  //     // const data: TF_trainingEntity[] = trainingLog.map((item) => ({
  //     //   ...item,
  //     //   model: savedModel,
  //     // }));
  //     // await this.trainingRepository.insert(data);
  //
  //     const sourceModel: TFModel_Entity = await this.getModel(id);
  //
  //     await this.trainingRepository.delete({ model: sourceModel });
  //
  //     // await this.averageTemperatureRepository
  //     //   .createQueryBuilder('averageTemperature')
  //     //   .update(AverageTemperatureEntity)
  //     //   .set({ train: () => `CASE ${predicts} END` })
  //     //   .where('month IN (:...months)', { months })
  //     //   .execute();
  //     //
  //
  //     // ============================================
  //     // Get predictions for training data
  //     // ============================================
  //     const trainPredictions: any = model.predict(xData);
  //     const trainPredictionsData = await trainPredictions.data();
  //
  //     const predictedPoints = [];
  //     for (let i = 0; i < trainMonths.length; i++) {
  //       predictedPoints.push({
  //         x: trainMonths[i],
  //         y: trainPredictionsData[i],
  //       });
  //     }
  //
  //     const months: number[] = predictedPoints.map((item) => item.x);
  //     const predicts: any = predictedPoints
  //       .map((item) => `WHEN month = ${item.x} THEN ${item.y}`)
  //       .join(' ');
  //
  //     await this.averageTemperatureRepository
  //       .createQueryBuilder('averageTemperature')
  //       .update(AverageTemperatureEntity)
  //       .set({ train: () => `CASE ${predicts} END` })
  //       .where('month IN (:...months)', { months })
  //       .execute();
  //
  //     return model;
  //   } catch (err) {
  //     console.error('Error training Model', err);
  //     throw err;
  //   }
  // }

  private async predictData(model) {
    // ============================================
    // PREDICT FOR NEXT YEAR (2025)
    // Months 37-48
    // ============================================

    const originalData = await this.getSeasonsData();
    console.log('originalData', originalData);

    console.log('\n=== PREDICTIONS FOR NEXT YEAR (2025) from Save Model ===');

    const nextYearMonths = [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48];
    const nextYearFeatures = createFeatures(nextYearMonths);
    const nextYearX = tf.tensor2d(nextYearFeatures);
    const nextYearPredictions = model.predict(nextYearX);
    const nextYearData = await nextYearPredictions.data();

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const nextYearResults = [];
    for (let i = 0; i < nextYearMonths.length; i++) {
      const monthNum = nextYearMonths[i];
      const calendarMonth = ((monthNum - 1) % 12) + 1;
      const temp = nextYearData[i];
      nextYearResults.push({
        monthNumber: monthNum,
        calendarMonth: calendarMonth,
        monthName: monthNames[i],
        temperature: temp,
      });
      console.log(`${monthNames[i]} 2025: ${temp.toFixed(1)}°C`);
    }

    const data: any = nextYearResults.map((item) => ({
      month: item.monthNumber,
      predict: item.temperature,
      cityId: 1,
    }));
    await this.averageTemperatureRepository.save(data);

    // ============================================
    // VALIDATION: Compare predictions vs actual for 2024
    // ============================================
    console.log('\n=== VALIDATION: 2024 Actual vs Predicted ===');

    // Cleanup
    // trainPredictions.dispose();
    nextYearX.dispose();
    nextYearPredictions.dispose();
    // xData.dispose();
    // yData.dispose();

    return {
      ...originalData,
      nextYearPredictions: nextYearResults.map((item) => ({
        x: item.monthNumber,
        y: item.temperature,
      })),
      nextYearX: nextYearResults.map((item) => item.monthNumber),
      nextYearY: nextYearResults.map((item) => item.temperature),
    };
  }

  async createNewModel(modelParams: CreatModelDto) {
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
      const trainedModel = await this.trainingModel.retrainModel(
        id,
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

  async predict(modelId: number) {
    const model = await this.loadModel.loadModelFromPostgreSQL(modelId);
    if (!model) {
      // TODO: Create model
      //return await this.predictData(trainedModel);
    }

    return await this.predictData(model);
  }
}
