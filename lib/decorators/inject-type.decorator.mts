import "reflect-metadata";
import { InjectTransformModule } from "../inject-transform.module.mjs";
import { Type } from "class-transformer";
import { InjectTypeOptions, TypeInjector } from "../interfaces/index.mjs";
import { Type as NestType } from "@nestjs/common";

export function InjectType(
  typeInjector: NestType<TypeInjector>,
  options: InjectTypeOptions = {}
): PropertyDecorator {
  return (target, propertyKey) =>
    Type((type?) => {
      const injector = InjectTransformModule.getInjectTransformContainer();

      return injector.get<TypeInjector>(typeInjector).inject(type);
    }, options)(target, propertyKey);
}
