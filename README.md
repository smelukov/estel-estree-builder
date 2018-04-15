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

## Usage another version of ES

By default, the builder can generate AST with ES2018-features (inclusive ES5/2015/2016/2017 features), but you can choose ES-version:

```js
const es2018builder = require('estel-estree-builder/generated/es2018'); // es5-es2018
const es2015builder = require('estel-estree-builder/generated/es2015'); // es5-es2015
const es5builder = require('estel-estree-builder/generated/es5'); // es5
```

## Usage Typescript

You can also use builder in Typescript:

```ts
import es2018builder from 'estel-estree-builder/generated/es2018.ts'; // es5-es2018
import es2015builder from 'estel-estree-builder/generated/es2015.ts'; // es5-es2015
import es5builder from 'estel-estree-builder/generated/es5.ts'; // es5
```