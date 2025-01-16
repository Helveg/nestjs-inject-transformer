import {
  DynamicModule,
  Inject,
  InjectionToken,
  Module,
  OnModuleDestroy,
  OnModuleInit,
  Optional,
} from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { AppStateService } from "./app-state.service.mjs";
import { InjectTransformModuleOptions } from "./interfaces/index.mjs";
import { InjectLifecycleError } from "./exceptions.mjs";
import { INJECT_TRANSFORM_MODULE_OPTIONS } from "./symbols.mjs";
import { AsyncLocalStorage } from "node:async_hooks";

@Module({ providers: [AppStateService] })
export class InjectTransformModule implements OnModuleInit, OnModuleDestroy {
  private static storage = new AsyncLocalStorage<ModuleRef>();

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

  public static getInjectTransformContainer(): {
    get: ModuleRef["get"];
  } {
    const moduleRef = InjectTransformModule.storage.getStore();
    if (!moduleRef)
      throw new InjectLifecycleError(
        `Dependency injection in class-transformer only available during app lifecycle.` +
          ` Did you forget to import the InjectTransformModule?`
      );

    return {
      get: (token: InjectionToken) => moduleRef.get(token, { strict: false }),
    };
  }

  constructor(
    private readonly moduleRef: ModuleRef,
    @Inject(INJECT_TRANSFORM_MODULE_OPTIONS)
    @Optional()
    private readonly moduleOptions: InjectTransformModuleOptions
  ) {}

  onModuleInit() {
    InjectTransformModule.storage.enterWith(this.moduleRef);
  }

  onModuleDestroy() {
    InjectTransformModule.storage.disable(); // Clean up the storage
  }
}
