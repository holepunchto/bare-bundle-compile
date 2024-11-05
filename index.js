module.exports = (bundle) => `{
  const __bundle = {
    builtinRequire: typeof require === 'function' ? require : null,
    cache: Object.create(null),
    load: (href) => {
      if (__bundle.cache[href]) return __bundle.cache[href]

      const file = __bundle.files[href] || null

      if (file === null) throw new Error(\`Cannot find module '\${href}'\`)

      const module = __bundle.cache[href] = {
        filename: href,
        dirname: href.slice(0, href.lastIndexOf('/')) || '/',
        exports: {}
      }

      function require (specifier) {
        return __bundle.load(require.resolve(specifier)).exports
      }

      require.main = ${JSON.stringify(bundle.main)}
      require.cache = __bundle.cache

      require.resolve = function resolve (specifier) {
        const resolved = file.imports[specifier]

        if (!resolved || (typeof resolved === 'object' && !resolved.default)) {
          throw new Error(\`Cannot find module '\${specifier}' imported from '\${href}'\`)
        }

        return typeof resolved === 'object' ? resolved.default : resolved
      }

      require.asset = function asset (specifier) {
        const resolved = file.imports[specifier]

        if (!resolved || (typeof resolved === 'object' && !resolved.asset)) {
          throw new Error(\`Cannot find asset '\${specifier}' imported from '\${href}'\`)
        }

        return typeof resolved === 'object' ? resolved.asset : resolved
      }

      require.addon = function addon (specifier = '.') {
        if (!__bundle.builtinRequire || !__bundle.builtinRequire.addon) {
          throw new Error('Cannot load addons')
        }

        const resolved = file.imports[specifier]

        if (!resolved || (typeof resolved === 'object' && !resolved.addon)) {
          throw new Error(\`Cannot find addon '\${specifier}' imported from '\${href}'\`)
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

  __bundle.load(${JSON.stringify(bundle.main)})
}`
