import { InjectTransformModule } from "./inject-transform.module.mjs";
import { Body, Controller, Module, Post } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { InjectTransform } from "./decorators/index.mjs";
import { plainToInstance } from "class-transformer";
import { default as supertest } from "supertest";

const x = Symbol("eh");

class TestSubject {
  @InjectTransform((params, tokenValue: number) => params.value + tokenValue, {
    inject: [x],
  })
  x: number;
}

@Controller()
class TestController {
  @Post("/")
  returnInject(@Body() subject: TestSubject) {
    return plainToInstance(TestSubject, subject);
  }
}

@Module({
  imports: [InjectTransformModule],
  controllers: [TestController],
  providers: [{ provide: x, useValue: 10 }],
})
class TestAppModuleWithImport {}

describe("InjectTransformModule", () => {
  it("should hint at import when no context is found", () => {
    expect(() => InjectTransformModule.getInjectTransformContainer()).toThrow(
      "Did you forget to import the InjectTransformModule?"
    );
  });

  it("should inject during controller requests", async () => {
    const app = await NestFactory.create(TestAppModuleWithImport);
    await app.init();

    await supertest(app.getHttpServer())
      .post("/")
      .send({ x: 5 })
      .expect(201)
      .expect({ x: 15 });

    await app.close();
  });

  it("should error without an active application", async () => {
    expect(() => plainToInstance(TestSubject, { x: 5 })).toThrow();
  });
});
