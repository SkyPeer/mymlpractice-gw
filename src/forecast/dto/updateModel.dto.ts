export class UpdateModelDto {
  readonly epochs: number;
  readonly batchSize: number;
  readonly model_name: string;
  readonly description: string;
}
