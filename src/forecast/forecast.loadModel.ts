import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TFModel_Entity } from '@app/forecast/entities/tf_model.entity';
import * as tf from '@tensorflow/tfjs-node';
import { TF_trainingEntity } from '@app/forecast/entities/tf_training.entity';

@Injectable()
export class LoadModelService {
  constructor(
    @InjectRepository(TFModel_Entity)
    private readonly modelRepository: Repository<TFModel_Entity>,
    @InjectRepository(TF_trainingEntity)
    private readonly trainingRepository: Repository<TF_trainingEntity>,
  ) {}

  async getModelById(id: number): Promise<TFModel_Entity> {
    const model = await this.modelRepository.findOne({
      where: { id: Number(id) },
    });
    if (!model) {
      throw new HttpException(
        `No model with id ${Number(id)}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return model;
  }

  // TODO: getTrainingsById
  async getTrainings(id: number): Promise<Partial<TF_trainingEntity>[]> {
    const model: TFModel_Entity = await this.getModelById(id);
    const data: TF_trainingEntity[] = await this.trainingRepository.find({
      where: { model },
    });

    console.log(' ');
    console.log(' ');
    console.log(' ');
    console.log(' ');
    console.log('model', model);
    console.log(' ');
    console.log(' ');
    console.log('data', data);
    console.log(' ');
    console.log(' ');
    console.log(' ');

    return data.map((training: TF_trainingEntity) => ({
      epoch: Number(training.epoch),
      loss: Number(training.loss),
    }));
  }

  async loadModelFromPostgreSQL(modelId: number) {
    console.log('\n=== LOADING MODEL FROM POSTGRESQL ===');

    const { model_topology, weight_specs, weights, model_name } =
      await this.getModelById(modelId);

    // Parse model topology
    const modelTopology = JSON.parse(JSON.parse(model_topology));
    const weightSpecs = JSON.parse(weight_specs);

    const model = await tf.models.modelFromJSON(modelTopology);

    // Now load weights separately
    const weightData = new Uint8Array(weights);
    const weightTensors = [];
    let offset = 0;

    for (const spec of weightSpecs) {
      const size = spec.shape.reduce((a, b) => a * b, 1);
      const bytes = size * 4; // 4 bytes per float32
      const tensorData = weightData.slice(offset, offset + bytes);
      const tensor = tf.tensor(new Float32Array(tensorData.buffer), spec.shape);
      weightTensors.push(tensor);
      offset += bytes;
    }

    // Set the loaded weights to the model
    model.setWeights(weightTensors);
    console.log(`✓ Model loaded from PostgreSQL: ${model_name}`);

    // Cleanup
    // weightTensors.forEach(tensor => tensor.dispose());

    return model;
  }
}
