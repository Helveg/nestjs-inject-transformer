import {
  DynamicModule,
  Inject,
  InjectionToken,
  Module,
  Optional,
} from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { AppStateService } from "./app-state.service";
import { InjectTransformContainerOptions } from "./interfaces";
import { InjectLifecycleError } from "./exceptions.js";
import { InjectTransformModuleOptions } from "./interfaces/inject-transform-module-options.interface.js";
import { INJECT_TRANSFORM_MODULE_OPTIONS } from "./symbols.js";

@Module({ providers: [AppStateService] })
export class InjectTransformModule {
  private static injectTransformModule: InjectTransformModule;

  public static forRoot(
    options: InjectTransformModuleOptions = {}
  ): DynamicModule {
    return {
      module: InjectTransformModule,
      providers: [
        { provide: INJECT_TRANSFORM_MODULE_OPTIONS, useValue: options },
      ],
    };
  }

  public static getInjectTransformContainer(
    options?: InjectTransformContainerOptions
  ): {
    get: ModuleRef["get"];
  } {
    // Retrieve reference to currently running global module
    const { moduleRef, moduleOptions } =
      InjectTransformModule.injectTransformModule ??
      ({} as InjectTransformModule);
    options = { ...moduleOptions, ...options };

    const appRunning = moduleRef?.get(AppStateService).isRunning ?? false;
    if (!appRunning && !options.ignoreInjectLifecycle) {
      throw new InjectLifecycleError(
        "Dependency injection in class-transformer unavailable outside of module context." +
          (!InjectTransformModule.injectTransformModule
            ? " Did you forget to import the InjectTransformModule?"
            : "")
      );
    }

    return {
      get: (token: InjectionToken) => moduleRef?.get(token, { strict: false }),
    };
  }

  public static getInjectTransformModule() {
    return this.injectTransformModule;
  }

  public static clearInjectTransformModule() {
    this.injectTransformModule = undefined;
  }

  constructor(
    private readonly moduleRef: ModuleRef,
    @Inject(INJECT_TRANSFORM_MODULE_OPTIONS)
    @Optional()
    private readonly moduleOptions: InjectTransformModuleOptions
  ) {
    InjectTransformModule.injectTransformModule = this;
  }
}
