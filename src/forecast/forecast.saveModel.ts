import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TFModel_Entity } from '@app/forecast/entities/tf_model.entity';
import { CreatModelDto } from '@app/forecast/dto/createModel.dto';
import { LoadModelService } from '@app/forecast/forecast.loadModel';

@Injectable()
export class SaveModelService {
  constructor(
    @InjectRepository(TFModel_Entity)
    private readonly modelRepository: Repository<TFModel_Entity>,
    private readonly loadModelService: LoadModelService,
  ) {}

  private async prepareModelToPostgreSQL(
    modelParams: CreatModelDto,
    model: any,
  ) {
    try {
      const { model_name, description, epochs, batchSize } = modelParams;
      console.log('\n=== PREPARE MODEL FOR SAVE TO POSTGRESQL ===');

      // Get model as JSON
      const modelJSON = await model.toJSON();
      const modelTopology = JSON.stringify(modelJSON);

      // Get weights as ArrayBuffer
      const weightData = await model.getWeights();
      // const description: string = 'description_model_test';
      const weightSpecs = weightData.map((tensor) => ({ ...tensor }));

      // Convert weights to Buffer
      const weightsBuffer = Buffer.concat(
        weightData.map((tensor) => Buffer.from(tensor.dataSync().buffer)),
      );

      const saveModel = new TFModel_Entity();
      saveModel.model_name = model_name;
      saveModel.model_topology = modelTopology;
      saveModel.weight_specs = JSON.stringify(weightSpecs);
      saveModel.weights = weightsBuffer;
      saveModel.description = description;
      saveModel.epochs = epochs;
      saveModel.batchSize = batchSize;

      return saveModel;
    } catch (err) {
      console.error('Error preparing model for DB:', err);
      throw err;
    }
  }

  async saveModel(
    modelParams: CreatModelDto,
    model: any,
  ): Promise<TFModel_Entity> {
    const { model_name } = modelParams;
    const saveModel = await this.prepareModelToPostgreSQL(modelParams, model);
    console.log(`✓ Model updated to PostgreSQL: ${model_name}`);
    return await this.modelRepository.save(saveModel);
  }

  async updateModel(
    id: number,
    modelParams: CreatModelDto,
    model: any,
  ): Promise<TFModel_Entity> {
    const updateModel = await this.prepareModelToPostgreSQL(modelParams, model);
    console.log(`✓ Model updated to PostgreSQL: ${modelParams.model_name}`);

    // TODO: Cleanup
    // weightData.forEach(tensor => tensor.dispose());
    await this.modelRepository.update(id, updateModel);
    return this.loadModelService.getModelById(id);
  }
}
