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

  @Column({ type: 'integer', nullable: true })
  epoch: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  loss: number;

  // Heap used by the process at the end of the epoch, MB
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string | null) => (value == null ? null : parseFloat(value)),
    },
  })
  memory: number | null;

  // CPU usage since the previous epoch, percent of wall-clock time
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string | null) => (value == null ? null : parseFloat(value)),
    },
  })
  cpu: number | null;

  // @Column()
  // modelId: number;

  @ManyToOne(() => TFModel_Entity, (model) => model.trainings, { eager: false })
  model: TFModel_Entity;
  // @JoinColumn({ name: 'modelId' })
}
