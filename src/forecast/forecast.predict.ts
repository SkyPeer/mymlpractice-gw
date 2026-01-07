import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TFModel_Entity } from '@app/forecast/entities/tf_model.entity';
import * as tf from '@tensorflow/tfjs-node';
import { AverageTemperatureEntity } from '@app/forecast/entities/average_temperature.entity';
import { LoadModelService } from '@app/forecast/forecast.loadModel';
import { TrainingService } from '@app/forecast/forecast.training';

@Injectable()
export class PredictService {
  constructor(
    @InjectRepository(TFModel_Entity)
    private readonly modelRepository: Repository<TFModel_Entity>,

    @InjectRepository(AverageTemperatureEntity)
    private readonly averageTemperatureRepository: Repository<AverageTemperatureEntity>,
    private readonly loadModelService: LoadModelService,
    private readonly trainingService: TrainingService,
  ) {}

  async predictData(model: any, dataSet: any, nextYearMonths: number[]) {
    // ============================================
    // PREDICT FOR NEXT YEAR (2025)
    // Months 37-48
    // ============================================

    console.log('\n=== PREDICTIONS FOR NEXT YEAR (2025) from Save Model ===');

    // const nextYearMonths = [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48];
    const nextYearFeatures =
      this.trainingService.createTensorFeatures(nextYearMonths);
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
      ...dataSet,
      nextYearPredictions: nextYearResults.map((item) => ({
        x: item.monthNumber,
        y: item.temperature,
      })),
      nextYearX: nextYearResults.map((item) => item.monthNumber),
      nextYearY: nextYearResults.map((item) => item.temperature),
    };
  }
}
