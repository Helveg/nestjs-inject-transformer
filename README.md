<p align="center">
Amp up your NestJS and `class-transformer` stack with dependency injection!
</p>

## Installation and setup

### Install the dependency

```
npm install nestjs-inject-transformer --save
```

### Import the `InjectTransformModule`

```ts
import { InjectTransformModule } from 'nestjs-inject-transformer';

@Module({
    imports: [InjectTransformModule]
})
export class ApplicationModule {}
```

## Usage

This package provides the `InjectTransform` and `InjectType` decorators
which support all options of their `class-transformer` respective counterparts `Transform` and `Type`.

### `InjectTransform`

Replace your `Transform` decorator with the dependency injection enabled `InjectTransform` decorator.

To inject a dependencies pass an array of injection tokens to the `inject` option. They will be passed
as additional arguments to your transform function, in the order they were given:

```ts
import { InjectTransform } from 'nestjs-inject-transformer';

export class MyDTO {
    @InjectTransform(
        (params, myService: MyService) => myService.parse(params.value),
        {inject: [MyService]}
    )
    myAttr: number;
}
```

> [!WARN]
>
> `class-transformer` operates strictly synchronously. Promises can not be awaited!

Alternatively, you can pass an `InjectTransformer` to tidy up more extensive use cases:

```ts
import {InjectTransform, InjectTransformer} from 'nestjs-inject-transformer';
import {TransformFnParams} from "class-transformer";

export class MyTransformer implements InjectTransformer {
    constructor(
        private readonly dep1: Dependency1,
        private readonly dep2: Dependency2,
        private readonly dep3: Dependency3
    ) {}

    transform(params: TransformFnParams): any {
        return this.dep1.parse(this.dep2.format(this.dep3.trim(params.value)));
    }
}

export class MyDTO {
    @InjectTransform(MyTransformer)
    myAttr: number;
}
```

### `InjectType`

This decorator allows you to provide a dependency injection enabled type injector. Like the
type transformer you can use the type injector's class body to scaffold your dependencies.

Its `inject` function is called with the same arguments as the `Type` function would have been.

The following example illustrates how you could return different DTO types (and thereby different
validation schemes when used in combination with `class-validator`) based on a supposed client's 
configuration:

```ts
@Injectable()
class ClientDtoInjector implements TypeInjector {
    constructor(
        private readonly service: ClientConfigurationService
    ) {}

    inject(type?: TypeHelpOptions) {
        const client = type.object['client'] ?? 'default';
        const clientConfig = this.service.getClientConfiguration(client);
        const dto = clientConfig.getNestedDTO(type.newObject, type.property);
        return dto
    }
}

class OpenAccountDTO {
    @IsString()
    client: string;
    
    @ValidateNested()
    @InjectType(ClientDtoInjector)
    accountInfo: AccountInfoDTO
}
```

## 📜 License

`nestjs-inject-transformer` is [MIT licensed](LICENSE).
