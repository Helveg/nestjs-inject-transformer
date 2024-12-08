import {TransformFnParams} from "class-transformer";

export interface InjectTransformer {
    transform(params: TransformFnParams): any
}