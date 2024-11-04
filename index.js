module.exports = (bundle) => `{
  const __bundle = {
    builtinRequire: typeof require === 'function' ? require : null,
    cache: Object.create(null),
    require: (filename) => {
      if (__bundle.cache[filename]) return __bundle.cache[filename]

      const file = __bundle.files[filename]

      const module = __bundle.cache[filename] = {
        exports: {},
        filename,
        dirname: filename.slice(0, filename.lastIndexOf('/')) || '/'
      }

      function require (specifier) {
        return __bundle.require(require.resolve(specifier)).exports
      }

      require.resolve = function resolve (specifier) {
        const resolved = file.imports[specifier]

        if (!resolved || (typeof resolved === 'object' && !resolved.default)) {
          throw new Error(\`Cannot find module '\${specifier}' imported from '\${module.filename}'\`)
        }

        return typeof resolved === 'object' ? resolved.default : resolved
      }

      require.asset = function asset (specifier) {
        const resolved = file.imports[specifier]

        if (!resolved || (typeof resolved === 'object' && !resolved.asset)) {
          throw new Error(\`Cannot find asset '\${specifier}' imported from '\${module.filename}'\`)
        }

        return typeof resolved === 'object' ? resolved.asset : resolved
      }

      require.addon = function addon (specifier = '.') {
        if (!__bundle.builtinRequire || !__bundle.builtinRequire.addon) {
          throw new Error('Cannot load addons')
        }

        const resolved = file.imports[specifier]

        if (!resolved || (typeof resolved === 'object' && !resolved.addon)) {
          throw new Error(\`Cannot find addon '\${specifier}' imported from '\${module.filename}'\`)
        }

        return __bundle.builtinRequire.addon(typeof resolved === 'object' ? resolved.addon : resolved)
      }

      file.evaluate(require, module, module.exports, module.filename, module.dirname)

      return module
    },
    files: {${[...bundle].map(([key, source]) => `
      ${JSON.stringify(key)}: {
        imports: ${JSON.stringify(bundle.resolutions[key] || {})},
        evaluate: (require, module, exports, __filename, __dirname) => {${key.endsWith('.json') ? 'module.exports = ' + source : source}}
      }`).join(',')}
    }
  }

  __bundle.require(${JSON.stringify(bundle.main)})
}`
