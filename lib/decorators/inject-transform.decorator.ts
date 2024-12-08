import { Transform } from "class-transformer";
import "reflect-metadata";
import { InjectTransformModule } from "../inject-transform.module.js";
import { InjectTransformOptions } from "../interfaces/index.js";
import { InjectTransformFn } from "../interfaces/inject-transform-fn.interface.js";
import { InjectTransformer } from "../interfaces/inject-transformer.interface.js";
import { Type } from "@nestjs/common";
import { isClass } from "../util/is-class.js";

export function InjectTransform(
  transformer: InjectTransformFn,
  options?: InjectTransformOptions
): PropertyDecorator;
export function InjectTransform(
  transformer: Type<InjectTransformer>,
  options?: Omit<InjectTransformOptions, "inject">
): PropertyDecorator;
export function InjectTransform(
  transformer: InjectTransformFn | Type<InjectTransformer>,
  options: InjectTransformOptions = {}
) {
  return Transform((params) => {
    const injector = InjectTransformModule.getInjectTransformContainer(options);
    const providers = options.inject ?? [];

    // Unify transformFn <-> transformer
    // * If it's a transformer, inject it and bind its transform function as transformFn.
    // * If it's a transformFn, use it directly.
    const transformerInstance = isClass(transformer)
      ? injector.get(transformer)
      : undefined;
    const transformFn =
      transformerInstance?.transform.bind(transformerInstance) ?? transformer;

    // Call the transform function, injecting all the dependencies in order.
    return transformFn(
      params,
      ...providers.map((provider) => injector.get(provider))
    );
  }, options);
}
