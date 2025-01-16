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

@Injectable()
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

A `TypeInjector` lets you inject types similar to the `Type` decorator. Its `inject` function is
called with the same arguments as the `Type` function would have been and should return the type
to be used.

The following example illustrates how you could return different DTO types (and thereby different
validation schemes when used with `class-validator`), based on a supposed client's 
configuration:

```ts
@Injectable()
class AccountDtoInjector implements TypeInjector {
    constructor(
        private readonly service: ClientConfigurationService
    ) {}

    inject(type?: TypeHelpOptions) {
        const client = type.object['client'] ?? 'default';
        const clientConfig = this.service.getClientConfiguration(client);
        if (clientConfig.accountType === 'named') {
            return NamedAccountDTO;
        } else if (clientConfig.accountType === 'numbered') {
            return NumberedAccountDTO;
        }
        return AccountDTO;
    }
}

class AccountDTO {
    @IsString()
    name: string;
}

class NamedAccountDTO extends AccountDTO {
    @IsString()
    id: string
}

class NumberedAccountDTO extends AccountDTO  {
    @IsNumber()
    id: number
}

class CreateAccountDTO {
    @IsString()
    client: string;

    @ValidateNested()
    @InjectType(AccountDtoInjector)
    accountInfo: NamedAccountDTO | NumberedAccountDTO;
}
```

## 📜 License

`nestjs-inject-transformer` is [MIT licensed](LICENSE).

