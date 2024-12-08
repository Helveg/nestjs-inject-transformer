import { TypeOptions } from "class-transformer";
import { InjectTransformContainerOptions } from "./inject-transform-container-options.interface.mjs";

export interface InjectTypeOptions
  extends TypeOptions,
    InjectTransformContainerOptions {}
