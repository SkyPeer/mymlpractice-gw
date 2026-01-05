import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult, DataSource } from 'typeorm';
import * as tf from '@tensorflow/tfjs-node';
import { TFModel_Entity } from '@app/forecast/entities/tf_model.entity';
import { TF_trainingEntity } from '@app/forecast/entities/tf_training.entity';
import { AverageTemperatureEntity } from '@app/forecast/entities/average_temperature.entity';
import { SaveModelService } from '@app/forecast/forecast.saveModel';

// TODO: Set specs by params
// TODO: Set dataset by params
// TODO: Set model by city

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(AverageTemperatureEntity)
    private readonly averageTemperatureRepository: Repository<AverageTemperatureEntity>,
    @InjectRepository(TF_trainingEntity)
    private readonly trainingRepository: Repository<TF_trainingEntity>,
    private readonly saveModel: SaveModelService,
  ) {}

  // CreateModel
  private createModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [3], units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 1 }),
      ],
    });
    model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'meanSquaredError',
    });
    return model;
  }

  // Helper function to create seasonal features
  private createFeatures(monthNumbers) {
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

  async trainModel(
    epochs: number,
    batchSize: number,
    model_name: string,
    description: string,
    dataSet: any,
  ): Promise<any> {
    console.log('\n=== trainModel === START === ');

    try {
      const trainMonths = dataSet.months;
      const trainTemperatures = dataSet.temps;
      console.log('Creating model with seasonal features...');
      const model = this.createModel();

      const trainingLog: any[] = [];

      // Create features with seasonal patterns
      const trainFeatures = this.createFeatures(trainMonths);
      const xData = tf.tensor2d(trainFeatures);
      const yData = tf.tensor2d(trainTemperatures, [
        trainTemperatures.length,
        1,
      ]);

      // Train the model
      console.log('Training model...');
      await model.fit(xData, yData, {
        // epochs: 200, // 200  //TODO: config!
        // batchSize: 12, // 12 //TODO: config!
        epochs,
        batchSize,
        callbacks: {
          onEpochEnd: (epoch: number, logs: any) => {
            console.log('epoch:', epoch, ' - Log:', logs.loss);
            trainingLog.push({ epoch, loss: logs.loss });
            if (epoch % 50 === 0) {
              //console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
            }
          },
        },
      });

      // ============================================
      // Save TrainedModel
      // ============================================
      const savedModel: TFModel_Entity =
        await this.saveModel.saveModelToPostgreSQL(
          epochs,
          batchSize,
          model_name,
          description,
          model,
        );

      // ============================================
      // Save TrainingLog
      // ============================================
      const data: TF_trainingEntity[] = trainingLog.map((item) => ({
        ...item,
        model: savedModel,
      }));
      await this.trainingRepository.insert(data);

      // ============================================
      // Get predictions for training data
      // ============================================
      const trainPredictions: any = model.predict(xData);
      const trainPredictionsData = await trainPredictions.data();

      const predictedPoints = [];
      for (let i = 0; i < trainMonths.length; i++) {
        predictedPoints.push({
          x: trainMonths[i],
          y: trainPredictionsData[i],
        });
      }

      const months: number[] = predictedPoints.map((item) => item.x);
      const predicts: any = predictedPoints
        .map((item) => `WHEN month = ${item.x} THEN ${item.y}`)
        .join(' ');

      await this.averageTemperatureRepository
        .createQueryBuilder('averageTemperature')
        .update(AverageTemperatureEntity)
        .set({ train: () => `CASE ${predicts} END` })
        .where('month IN (:...months)', { months })
        .execute();

      return model;
    } catch (err) {
      console.error('Error training Model', err);
      throw err;
    }
  }
}
