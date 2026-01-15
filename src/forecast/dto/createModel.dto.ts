export class CreatModelDto {
  readonly epochs: number;
  readonly batchSize: number;
  readonly trainingPeriod?: number[];
  readonly model_name: string;
  readonly description: string;
}
