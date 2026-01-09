import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  JoinColumn,
} from 'typeorm';
import { CityEntity } from '@app/forecast/entities/city.entity';

@Entity({ name: 'average_temperature' })
@Unique(['month', 'cityId']) //Composite unique constraint
export class AverageTemperatureEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  temp: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  train: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  predict: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  month: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timeStamp: Date;

  @Column()
  cityId: number;

  @ManyToOne(() => CityEntity, (city) => city.temperatures, { eager: true })
  @JoinColumn({ name: 'cityId' })
  city: CityEntity;
}
