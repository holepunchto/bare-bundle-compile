# bare-bundle-compile

Compile a bundle of CommonJS or ES modules.

```
npm i bare-bundle-compile
```

> [!NOTE]
> Bundle compilation is designed for situations where no existing module system is available and where no APIs beyond ECMAScript builtins exist. For a more general approach to running bundles across JavaScript runtimes, see <https://github.com/holepunchto/bare-bundle-evaluate>.

## Usage

### CommonJS

```js
const Bundle = require('bare-bundle')
const compile = require('bare-bundle-compile/cjs')

const bundle = new Bundle()
  .write('/foo.js', "module.exports = require('./bar')", {
    main: true,
    imports: {
      './bar': '/bar.js'
    }
  })
  .write('/bar.js', 'module.exports = 42')

eval(compile(bundle)).exports
// 42
```

### ESM

```js
const Bundle = require('bare-bundle')
const compile = require('bare-bundle-compile/esm')

const bundle = new Bundle()
  .write('/foo.js', "import bar from './bar'", {
    main: true,
    imports: {
      './bar': '/bar.js'
    }
  })
  .write('/bar.js', 'export default 42')

const { main, imports } = compile(bundle)

html`<script type="importmap">
    ${JSON.stringify(imports)}
  </script>

  <script type="module">
    await import(${JSON.stringify(main)})
    // Module { default: 42 }
  </script>`
```

## API

#### `const result = compile.cjs(bundle)`

#### `const result = compile.esm(bundle)`

## License

Apache-2.0
