# bare-bundle-compile

Compile a bundle of CommonJS modules to a single module.

```
npm i bare-bundle-compile
```

> [!NOTE]
> Bundle compilation is designed for situations where no existing module system is available and where no APIs beyond ECMAScript builtins exist. For a more general approach to running bundles across JavaScript runtimes, see <https://github.com/holepunchto/bare-bundle-evaluate>.

## Usage

```js
const Bundle = require('bare-bundle')
const compile = require('bare-bundle-compile')

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

## API

#### `const code = compile(bundle)`

## License

Apache-2.0
