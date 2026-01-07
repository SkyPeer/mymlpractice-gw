import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ForecastTemperatureEntity } from '@app/forecast/entities/temperature.entity';
import { TFModel_Entity } from '@app/forecast/entities/tf_model.entity';

@Entity({ name: 'tf_trainings' })
export class TF_trainingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  epoch: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  loss: number;

  // @Column()
  // modelId: number;

  @ManyToOne(() => TFModel_Entity, (model) => model.trainings, { eager: false })
  model: TFModel_Entity;
  // @JoinColumn({ name: 'modelId' })
}
