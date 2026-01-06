import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TFModel_Entity } from '@app/forecast/entities/tf_model.entity';
import { CreatModelDto } from '@app/forecast/dto/createModel.dto';
import { UpdateModelDto } from '@app/forecast/dto/updateModel.dto';

@Injectable()
export class SaveModelService {
  constructor(
    @InjectRepository(TFModel_Entity)
    private readonly modelRepository: Repository<TFModel_Entity>,
  ) {}

  private async getModel(id: number): Promise<TFModel_Entity> {
    return await this.modelRepository.findOne({ where: { id: Number(id) } });
  }

  // async saveModelToPostgreSQL(
  //   epochs: number,
  //   batchSize: number,
  //   model_name: string,
  //   description: string,
  //   model: any,
  // ) {
  //   try {
  //     console.log('\n=== SAVING MODEL TO POSTGRESQL ===');
  //
  //     // Get mode l as JSON
  //     const modelJSON = await model.toJSON();
  //     const modelTopology = JSON.stringify(modelJSON);
  //
  //     // Get weights as ArrayBuffer
  //     const weightData = await model.getWeights();
  //     // const description: string = 'description_model_test';
  //     const weightSpecs = weightData.map((tensor) => ({ ...tensor }));
  //
  //     // Convert weights to Buffer
  //     const weightsBuffer = Buffer.concat(
  //       weightData.map((tensor) => Buffer.from(tensor.dataSync().buffer)),
  //     );
  //
  //     const saveModel = new TFModel_Entity();
  //
  //     saveModel.model_name = model_name;
  //     saveModel.model_topology = modelTopology;
  //     saveModel.weight_specs = JSON.stringify(weightSpecs);
  //     saveModel.weights = weightsBuffer;
  //     saveModel.description = description;
  //     saveModel.epochs = epochs;
  //     saveModel.batchSize = batchSize;
  //
  //     const savedModel = await this.modelRepository.save(saveModel);
  //
  //     console.log(
  //       `✓ Model saved to PostgreSQL: ${model_name}`,
  //       'result',
  //       savedModel,
  //     );
  //
  //     // TODO: Cleanup
  //     // weightData.forEach(tensor => tensor.dispose());
  //
  //     return savedModel;
  //   } catch (err) {
  //     console.error('Error saving to PostgreSQL:', err);
  //     throw err;
  //   }
  // }

  async updateModelToPostgreSQL(id, model) {
    try {
      const sourceModel: TFModel_Entity = await this.getModel(id);
      const modelName = sourceModel.model_name;
      console.log('\n=== SAVING MODEL TO POSTGRESQL ===');

      // Get mode l as JSON
      const modelJSON = await model.toJSON();
      const modelTopology = JSON.stringify(modelJSON);

      // Get weights as ArrayBuffer
      const weightData = await model.getWeights();
      const description: string = 'description_model_test';
      const weightSpecs = weightData.map((tensor) => ({ ...tensor }));

      // Convert weights to Buffer
      const weightsBuffer = Buffer.concat(
        weightData.map((tensor) => Buffer.from(tensor.dataSync().buffer)),
      );

      const saveModel = new TFModel_Entity();

      saveModel.model_name = sourceModel.model_name;
      saveModel.model_topology = modelTopology;
      saveModel.weight_specs = JSON.stringify(weightSpecs);
      saveModel.weights = weightsBuffer;
      saveModel.description = description;
      // saveModel.city = cityId;

      const updatedModel = await this.modelRepository.update(id, saveModel);

      console.log(
        `✓ Model updated to PostgreSQL: ${modelName}`,
        'result',
        updatedModel,
      );

      // TODO: Cleanup
      // weightData.forEach(tensor => tensor.dispose());

      return updatedModel;
    } catch (err) {
      console.error('Error saving to PostgreSQL:', err);
      throw err;
    }
  }

  async prepareModelToPostgreSQL(modelParams: CreatModelDto, model: any) {
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
      console.error('Error preparing model for Save to PostgreSQL:', err);
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

  async updateModel(id: number, modelParams: UpdateModelDto, model: any) {
    const sourceModel: TFModel_Entity = await this.getModel(id);
    const model_name = sourceModel.model_name;
    const _modelParams = { ...modelParams, model_name };
    const saveModel = await this.prepareModelToPostgreSQL(_modelParams, model);
    const updatedModel = await this.modelRepository.update(id, saveModel);

    console.log(
      `✓ Model updated to PostgreSQL: ${model_name}`,
      'result',
      updatedModel,
    );

    // TODO: Cleanup
    // weightData.forEach(tensor => tensor.dispose());
    return updatedModel;
  }
}
