import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TFModel_Entity } from '@app/forecast/entities/tf_model.entity';
import * as tf from '@tensorflow/tfjs-node';
import { AverageTemperatureEntity } from '@app/forecast/entities/average_temperature.entity';
import { LoadModelService } from '@app/forecast/forecast.loadModel';
import { TrainingService } from '@app/forecast/forecast.training';
import { CityEntity } from '@app/forecast/entities/city.entity';

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

  async predictData(
    city: CityEntity,
    model: any,
    dataSet: any,
    nextYearMonths: number[],
  ) {
    // ============================================
    // PREDICT FOR NEXT YEAR (2025)
    // Months 37-48
    // ============================================

    console.log('\n=== PREDICTIONS FOR NEXT YEAR (2025) from Save Model ===');

    const nextYearFeatures =
      this.trainingService.createTensorFeatures(nextYearMonths);
    const nextYearX = tf.tensor2d(nextYearFeatures);
    const nextYearPredictions = model.predict(nextYearX);
    const nextYearData = await nextYearPredictions.data();

    // const monthNames = [
    //   'Jan',
    //   'Feb',
    //   'Mar',
    //   'Apr',
    //   'May',
    //   'Jun',
    //   'Jul',
    //   'Aug',
    //   'Sep',
    //   'Oct',
    //   'Nov',
    //   'Dec',
    // ];

    const nextYearResults = [];
    for (let i = 0; i < nextYearMonths.length; i++) {
      const monthNum = nextYearMonths[i];
      //const calendarMonth = ((monthNum - 1) % 12) + 1;
      const temp = nextYearData[i];
      nextYearResults.push({
        monthNumber: monthNum, //x
        //calendarMonth: calendarMonth,
        //monthName: monthNames[i],
        cityId: city.id,
        temperature: temp, //y
      });
      // console.log(`${monthNames[i]} 2025: ${temp.toFixed(1)}°C`);
    }

    // ============================================
    // Update or insert by sql
    // await this.averageTemperatureRepository.query(`
    //     INSERT INTO average_temperature (month, "cityId", predict)
    //     VALUES ${nextYearResults
    //       .map(
    //         ({ monthNumber, cityId, temperature }) =>
    //           `(${monthNumber}, ${cityId}, ${temperature})`,
    //       )
    //       .join(', ')}
    //       ON CONFLICT (month, "cityId")
    //     DO UPDATE SET predict = EXCLUDED.predict
    // `);
    //
    // ============================================
    // Update/Insert by typeorm
    // TODO: NeedFix without convert by fieldsName
    const data = nextYearResults.map(
      ({ monthNumber, cityId, temperature }) => ({
        month: monthNumber,
        cityId: cityId,
        predict: temperature,
      }),
    );

    await this.averageTemperatureRepository.upsert(
      data,
      ['month', 'cityId'], // composite conflict target
    );
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
