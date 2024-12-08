import { TransformFnParams } from "class-transformer";

export type InjectTransformFn = (
  params: TransformFnParams,
  ...dependencies: unknown[]
) => any;
