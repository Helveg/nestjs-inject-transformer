import { TransformOptions } from "class-transformer";
import { InjectionToken } from "@nestjs/common";
import { InjectTransformContainerOptions } from "./inject-transform-container-options.interface.js";

export interface InjectTransformOptions
  extends TransformOptions,
    InjectTransformContainerOptions {
  inject?: InjectionToken[];
}
