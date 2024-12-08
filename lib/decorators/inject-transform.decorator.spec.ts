import { plainToInstance, TransformFnParams } from "class-transformer";
import { Injectable, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { InjectTransform } from "./index.js";
import { InjectTransformModule } from "../inject-transform.module.js";
import { InjectLifecycleError } from "../exceptions.js";
import { InjectTransformer } from "../interfaces/inject-transformer.interface.js";

const TEST_TOKEN = Symbol("TestToken");
const MISSING_TOKEN = Symbol("MissingToken");

@Injectable()
class TestService {
  transform(a: number, b: number) {
    return a * b;
  }
}

@Injectable()
class TestTransformer implements InjectTransformer {
  transform(params: TransformFnParams) {
    return params.value * 4;
  }
}

@Module({
  imports: [InjectTransformModule],
  providers: [
    { provide: TEST_TOKEN, useValue: 5 },
    TestService,
    TestTransformer,
  ],
})
class TestAppModule {}

class TestSubject {
  @InjectTransform(
    (params, tokenValue: number, service: TestService) =>
      service.transform(params.value, tokenValue),
    {
      inject: [TEST_TOKEN, TestService],
    }
  )
  x: number;

  @InjectTransform(TestTransformer)
  xx: number;

  @InjectTransform(
    (params, tokenValue: number, service: TestService) =>
      service.transform(params.value, tokenValue),
    {
      inject: [TEST_TOKEN, TestService],
      ignoreInjectLifecycle: true,
    }
  )
  y: number;

  @InjectTransform((params) => 0, { inject: [MISSING_TOKEN] })
  z: number;
}

describe("InjectTransform", () => {
  it("should inject transform functions", async () => {
    const app = await NestFactory.createApplicationContext(TestAppModule);
    await app.init();

    // TestSubject.x injects the value 5 and a transform service that multiplies
    // by that value => 3 * 5 = 15.
    expect(plainToInstance(TestSubject, { x: 3 }).x).toEqual(15);

    await app.close();
  });

  it("should inject transformers", async () => {
    const app = await NestFactory.createApplicationContext(TestAppModule);
    await app.init();

    // TestSubject.xx injects a transformer that multiplies by 4
    expect(plainToInstance(TestSubject, { xx: 3 }).xx).toEqual(12);

    await app.close();
  });

  it("should error outside of injection lifecycle", async () => {
    const app = await NestFactory.createApplicationContext(TestAppModule);
    await app.init();
    await app.close();

    // Injecting while no app is open yet, or is closed already
    // is defended from by default as it may lead to unexpected behaviour.
    expect(() => plainToInstance(TestSubject, { x: 3 })).toThrow(
      InjectLifecycleError
    );
  });

  it("should optionally ignore lifecycle errors", async () => {
    const app = await NestFactory.createApplicationContext(TestAppModule);
    await app.init();
    await app.close();

    // TestSubject.y is marked with ignoreLifecycleErrors
    expect(plainToInstance(TestSubject, { y: 3 }).y).toEqual(15);
  });

  it("should error on missing providers", async () => {
    const app = await NestFactory.createApplicationContext(TestAppModule);
    await app.init();

    // TestSubject.z injects the missing MISSING_TOKEN provider.
    expect(() => plainToInstance(TestSubject, { z: 3 }).z).toThrow(
      "Nest could not find Symbol(MissingToken) element"
    );
    await app.close();
  });
});
