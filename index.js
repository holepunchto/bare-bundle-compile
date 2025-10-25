module.exports = function compile(bundle) {
  return `{
  const __bundle = {
    builtinRequire: typeof require === 'function' ? require : null,
    cache: Object.create(null),
    load: (url, attributes) => {
      const type = url.endsWith('.json')
        ? 'json'
        : url.endsWith('.bin')
          ? 'binary'
          : url.endsWith('.txt')
            ? 'text'
            : 'script'

      if (typeof attributes === 'object' && attributes !== null && attributes.type !== type) {
        throw new Error(\`Module '\${url}' is not of type '\${attributes.type}'\`)
      }

      let module = __bundle.cache[url] || null

      if (module !== null) return module

      const filename = url.replace(/^[a-z][a-z\\d+\\-.]*:\\/*/, '/')
      const dirname = filename.slice(0, filename.lastIndexOf('/')) || '/'

      module = __bundle.cache[url] = {
        url,
        type,
        filename,
        dirname,
        exports: {}
      }

      if (url.startsWith('builtin:')) {
        module.exports = __bundle.builtinRequire(url.replace(/^builtin:/, ''))

        return module
      }

      const fn = __bundle.modules[url] || null

      if (fn === null) throw new Error(\`Cannot find module '\${url}'\`)

      function require(specifier, opts = {}) {
        const attributes = opts && opts.with

        return __bundle.load(__bundle.resolve(specifier, url), attributes).exports
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

      fn(require, module, module.exports, module.filename, module.dirname)

      return module
    },
    resolve: (specifier, parentURL) => {
      const resolved = __bundle.imports[specifier] || __bundle.resolutions[parentURL]?.[specifier]

      if (!resolved || (typeof resolved === 'object' && !resolved.default)) {
        throw new Error(\`Cannot find module '\${specifier}' imported from '\${parentURL}'\`)
      }

      return typeof resolved === 'object' ? resolved.default : resolved
    },
    addon: (specifier = '.', parentURL) => {
      const resolved = __bundle.imports[specifier] || __bundle.resolutions[parentURL]?.[specifier]

      if (!resolved || (typeof resolved === 'object' && !resolved.addon)) {
        throw new Error(\`Cannot find addon '\${specifier}' imported from '\${parentURL}'\`)
      }

      return typeof resolved === 'object' ? resolved.addon : resolved
    },
    asset: (specifier, parentURL) => {
      const resolved = __bundle.imports[specifier] || __bundle.resolutions[parentURL]?.[specifier]

      if (!resolved || (typeof resolved === 'object' && !resolved.asset)) {
        throw new Error(\`Cannot find asset '\${specifier}' imported from '\${parentURL}'\`)
      }

      return typeof resolved === 'object' ? resolved.asset : resolved
    },
    imports: ${JSON.stringify(bundle.imports)},
    resolutions: ${JSON.stringify(bundle.resolutions)},
    modules: {${[...bundle]
      .map(
        ([key, source]) => `
      ${JSON.stringify(key)}: (require, module, exports, __filename, __dirname, __bundle) => {${
        key.endsWith('.json')
          ? `module.exports = ${source}`
          : key.endsWith('.bin')
            ? `module.exports = Buffer.from(${JSON.stringify(source.toString('base64'))}, 'base64')`
            : key.endsWith('.txt')
              ? `module.exports = ${JSON.stringify(source.toString())}`
              : source
      }}`
      )
      .join(',')}
    }
  }

  __bundle.load(${JSON.stringify(bundle.main)})
}`
}
