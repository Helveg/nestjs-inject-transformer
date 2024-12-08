import { InjectTransformModule } from "./inject-transform.module.mjs";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { InjectTransform } from "./decorators/index.mjs";
import { plainToInstance } from "class-transformer";
import { InjectLifecycleError } from "./exceptions.mjs";

@Module({ imports: [InjectTransformModule] })
class TestAppModuleWithImport {}

@Module({ imports: [] })
class TestAppModuleWithoutImport {}

@Module({
  imports: [InjectTransformModule.forRoot({ ignoreInjectLifecycle: true })],
})
class TestAppModuleWithOptions {}

describe("InjectTransformModule", () => {
  beforeEach(() => InjectTransformModule.clearInjectTransformModule());

  it("should set the global module when injected", async () => {
    await NestFactory.createApplicationContext(TestAppModuleWithImport);
    expect(
      InjectTransformModule.getInjectTransformModule()
    ).not.toBeUndefined();
  });

  it("should not have a global module when not injected", async () => {
    await NestFactory.createApplicationContext(TestAppModuleWithoutImport);
    expect(InjectTransformModule.getInjectTransformModule()).toBeUndefined();
  });

  it("should hint at import when using transform container without global module", () => {
    expect(() => InjectTransformModule.getInjectTransformContainer()).toThrow(
      "Did you forget to import the InjectTransformModule?"
    );
  });

  describe("Module options", () => {
    it("should consider module options", async () => {
      const app = await NestFactory.createApplicationContext(
        TestAppModuleWithOptions
      );
      await app.close();

      // Accessing the inject transform container when the app is closed should throw an error,
      // unless it has taken the `ignoreLifecycleErrors` module option into account, which this
      // test wants to assert.
      expect(
        InjectTransformModule.getInjectTransformContainer()
      ).not.toBeUndefined();
    });

    it("should override module options with decorator options", async () => {
      const app = await NestFactory.createApplicationContext(
        TestAppModuleWithOptions
      );
      await app.close();

      class Test {
        @InjectTransform(() => 5, { ignoreInjectLifecycle: false })
        x: number;
      }

      // Accessing the inject transform container when the app is closed should throw an error,
      // unless it has taken the `ignoreLifecycleErrors` module option into account, which this
      // test wants to assert to be overridden by the decorator options.
      expect(() => plainToInstance(Test, { x: 3 })).toThrow(
        InjectLifecycleError
      );
    });
  });
});
