import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { ForecastTemperatureEntity } from '@app/forecast/entities/temperature.entity';
import { TFModel_Entity } from '@app/forecast/entities/tf_model.entity';
import { AverageTemperatureEntity } from '@app/forecast/entities/average_temperature.entity';

@Entity({ name: 'forecast_cities' })
export class CityEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  lat: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  lon: number;

  @Column({ default: '' })
  city: string;

  @Column({ default: '' })
  country: string;

  @Column({ default: '' })
  description: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;

  @OneToMany(() => ForecastTemperatureEntity, (temperature) => temperature.city)
  temperatures: ForecastTemperatureEntity[];

  @OneToMany(() => AverageTemperatureEntity, (temp) => temp.city)
  average_temperatures: AverageTemperatureEntity[];

  @OneToOne(() => TFModel_Entity, (tfModel) => tfModel.city, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  tf_model: TFModel_Entity;
}
