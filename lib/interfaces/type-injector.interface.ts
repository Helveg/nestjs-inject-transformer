import { TypeHelpOptions } from "class-transformer";
import { Type } from "@nestjs/common";

export interface TypeInjector {
  inject(type?: TypeHelpOptions): Type;
}
