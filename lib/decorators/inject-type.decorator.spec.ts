import { Inject, Injectable, Module, Type } from "@nestjs/common";
import { InjectTransformModule } from "../inject-transform.module.mjs";
import { TypeInjector } from "../interfaces/type-injector.interface.mjs";
import { plainToInstance, Transform, TypeHelpOptions } from "class-transformer";
import { NestFactory } from "@nestjs/core";
import { InjectType } from "./inject-type.decorator.mjs";

const DTO_CONFIGURATION = Symbol("DtoConfiguration");

class ConfiguredDto {
  @Transform((params) => params.value * 4)
  a: number;

  f() {
    return this.a * 5;
  }
}

class FallbackDto extends ConfiguredDto {
  f() {
    return 0;
  }
}

@Injectable()
class TestInjector implements TypeInjector {
  constructor(
    @Inject(DTO_CONFIGURATION)
    private readonly dtoConfig: Record<string, Type<ConfiguredDto>>
  ) {}

  inject(type?: TypeHelpOptions) {
    return this.dtoConfig[type.property] ?? FallbackDto;
  }
}

class TestSubject {
  @InjectType(TestInjector)
  x: ConfiguredDto;

  @InjectType(TestInjector)
  y: ConfiguredDto;
}

@Module({
  imports: [InjectTransformModule],
  providers: [
    {
      provide: DTO_CONFIGURATION,
      useValue: {
        x: ConfiguredDto,
      },
    },
    TestInjector,
  ],
})
class TestAppModule {}

describe("InjectType", () => {
  it("should use type injector to inject types", async () => {
    await NestFactory.createApplicationContext(TestAppModule);
    const obj = plainToInstance(TestSubject, { x: { a: 1 }, y: { a: 3 } });

    // 4 (nested transform of ConfiguredDto.a) * 5 (f of ConfiguredDto) = 20
    expect(obj.x.f()).toEqual(20);

    // 0 (f of FallbackDto)
    expect(obj.y.f()).toEqual(0);
  });
});
