import "reflect-metadata";
import { InjectTransformModule } from "../inject-transform.module.mjs";
import { Type } from "class-transformer";
import { InjectTypeOptions } from "../interfaces/inject-type-options.interface.mjs";
import { TypeInjector } from "../interfaces/type-injector.interface.mjs";
import { Type as NestType } from "@nestjs/common";

export function InjectType(
  typeInjector: NestType<TypeInjector>,
  options: InjectTypeOptions = {}
): PropertyDecorator {
  return (target, propertyKey) =>
    Type((type?) => {
      const injector =
        InjectTransformModule.getInjectTransformContainer(options);

      return injector.get<TypeInjector>(typeInjector).inject(type);
    }, options)(target, propertyKey);
}
