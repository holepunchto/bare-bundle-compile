module.exports = (bundle) => `{
  const __bundle = {
    builtinRequire: typeof require === 'function' ? require : null,
    cache: Object.create(null),
    load: (url) => {
      if (__bundle.cache[url]) return __bundle.cache[url]

      const filename = url
      const dirname = url.slice(0, url.lastIndexOf('/')) || '/'

      const module = __bundle.cache[url] = {
        filename,
        dirname,
        exports: {}
      }

      if (url.startsWith('builtin:')) {
        module.exports = __bundle.builtinRequire(url.replace(/^builtin:/, ''))

        return module
      }

      const file = __bundle.files[url] || null

      if (file === null) throw new Error(\`Cannot find module '\${url}'\`)

      function require(specifier) {
        return __bundle.load(__bundle.resolve(specifier, url)).exports
      }

      require.main = ${JSON.stringify(bundle.main)}
      require.cache = __bundle.cache

      require.resolve = function resolve(specifier, parentURL = url) {
        return __bundle.resolve(specifier, parentURL)
      }

      require.addon = function addon(specifier = '.', parentURL = url) {
        return __bundle.builtinRequire.addon(__bundle.addon(specifier, parentURL))
      }

      require.addon.host = __bundle.builtinRequire.addon?.host

      require.addon.resolve = function resolve(specifier = '.', parentURL = url) {
        return __bundle.addon(specifier, parentURL)
      }

      require.asset = function asset(specifier, parentURL = url) {
        return __bundle.asset(specifier, parentURL)
      }

      file.evaluate(require, module, module.exports, module.filename, module.dirname)

      return module
    },
    resolve: (specifier, parentURL) => {
      const file = __bundle.files[parentURL] || null

      if (file === null) throw new Error(\`Cannot find module '\${parentURL}'\`)

      const resolved = file.imports[specifier]

      if (!resolved || (typeof resolved === 'object' && !resolved.default)) {
        throw new Error(\`Cannot find module '\${specifier}' imported from '\${parentURL}'\`)
      }

      return typeof resolved === 'object' ? resolved.default : resolved
    },
    addon: (specifier = '.', parentURL) => {
      const file = __bundle.files[parentURL] || null

      if (file === null) throw new Error(\`Cannot find module '\${parentURL}'\`)

      const resolved = file.imports[specifier]

      if (!resolved || (typeof resolved === 'object' && !resolved.addon)) {
        throw new Error(\`Cannot find addon '\${specifier}' imported from '\${parentURL}'\`)
      }

      return typeof resolved === 'object' ? resolved.addon : resolved
    },
    asset: (specifier, parentURL) => {
      const file = __bundle.files[parentURL] || null

      if (file === null) throw new Error(\`Cannot find module '\${parentURL}'\`)

      const resolved = file.imports[specifier]

      if (!resolved || (typeof resolved === 'object' && !resolved.asset)) {
        throw new Error(\`Cannot find asset '\${specifier}' imported from '\${parentURL}'\`)
      }

      return typeof resolved === 'object' ? resolved.asset : resolved
    },
    files: {${[...bundle]
      .map(
        ([key, source]) => `
      ${JSON.stringify(key)}: {
        imports: ${JSON.stringify(bundle.resolutions[key] || {})},
        evaluate: (require, module, exports, __filename, __dirname) => {${key.endsWith('.json') ? 'module.exports = ' + source : source}}
      }`
      )
      .join(',')}
    }
  }

  __bundle.load(${JSON.stringify(bundle.main)})
}`
