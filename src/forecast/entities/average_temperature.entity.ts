import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CityEntity } from '@app/forecast/entities/city.entity';

@Entity({ name: 'average_temperature' })
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

  @ManyToOne(() => CityEntity, (city) => city.temperatures, { eager: true })
  city: CityEntity;
}
