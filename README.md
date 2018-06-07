# estel-estree-builder

ESTree compatible AST builder for Javascript and Typescript.

All builder code was fully-generated from [ESTree spec](https://github.com/estree/estree)

## Install

```sh
npm install estel-estree-builder
```

## Usage

```js
const builder = require('estel-estree-builder');
const escodegen = require('escodegen');

const ast = builder.functionDeclaration(
    builder.identifier('helloWorld'),
    [builder.identifier('name')],
    builder.functionBody([
        builder.returnStatement(
            builder.binaryExpression(
                '+',
                builder.literal('Hello'),
                builder.identifier('name')
            )
        )
    ])
)

console.log(escodegen.generate(ast));
```

This example generates the following code:
```js
function helloWorld(name) {
    return 'Hello' + name;
}
```

## Using another version of ES

By default, the builder can generate AST with ES2018-features (inclusive ES5/2015/2016/2017 features), but you can choose ES-version:

```js
const es2018builder = require('estel-estree-builder/generated/es2018'); // es5-es2018
const es2015builder = require('estel-estree-builder/generated/es2015'); // es5-es2015
const es5builder = require('estel-estree-builder/generated/es5'); // es5
```

## Using Typescript

You can also use builder in Typescript:

```ts
import es2018builder from 'estel-estree-builder/generated/es2018.ts'; // es5-es2018
import es2015builder from 'estel-estree-builder/generated/es2015.ts'; // es5-es2015
import es5builder from 'estel-estree-builder/generated/es5.ts'; // es5
```

## Generator

The generator is a script that parses ESTree spec and generates the builder source files (JS or/and TS).

```sh
git clone https://github.com/smelukov/estel-estree-builder
cd estel-estree-builder
git submodule init
git submodule update

npm install
npm run generate
```

This will create `generated` directory and put a generated builder sources to it.

### Generator options

There are some options for generator:

`-t` - target source type (default is `[js, ts]`)
* `js`
* `ts`

`-es` - es-features that will be support generated builder (default is `[es2018]`)
* `es5`
* `es2015`
* `es2016`
* `es2017`
* `es2018`

`-o` - output folder (default is `generated`)

For exmaple, `npm run generate -- -es es5 es2015 es2018 -t ts -o types` will generate builder typescript-sources in `types` directory that support all es5+ features.
