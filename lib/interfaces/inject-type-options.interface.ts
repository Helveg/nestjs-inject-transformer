import { TypeOptions } from "class-transformer";
import { InjectTransformContainerOptions } from "./inject-transform-container-options.interface.js";

export interface InjectTypeOptions
  extends TypeOptions,
    InjectTransformContainerOptions {}
