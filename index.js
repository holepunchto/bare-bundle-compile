module.exports = function compile(bundle) {
  return `{
  const __bundle = {
    imports: ${JSON.stringify(bundle.imports)},
    resolutions: ${JSON.stringify(bundle.resolutions)},
    modules: {${[...bundle].map(
      ([key, source]) =>
        `${JSON.stringify(key)}: (require, module, exports, __filename, __dirname, __bundle) => {${compileModule(
          key,
          source
        )}}`
    )}
    },
    builtinRequire: typeof require === 'function' ? require : null,
    load(cache, url, referrer = null, attributes = null) {
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

      let module = cache[url] || null

      if (module !== null) return module

      const { imports, resolutions } = __bundle

      const filename = url
      const dirname = url.slice(0, url.lastIndexOf('/')) || '/'

      module = cache[url] = {
        url,
        type,
        filename,
        dirname,
        imports,
        resolutions,
        main: null,
        exports: {}
      }

      if (url.startsWith('builtin:')) {
        module.exports = __bundle.builtinRequire(url.replace(/^builtin:/, ''))

        return module
      }

      module.main = referrer ? referrer.main : module

      const fn = __bundle.modules[url] || null

      if (fn === null) throw new Error(\`Cannot find module '\${url}'\`)

      function require(specifier, opts = {}) {
        const attributes = opts && opts.with

        return __bundle.load(cache, __bundle.resolve(specifier, url), module, attributes).exports
      }

      require.main = module.main
      require.cache = cache

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
    resolve(specifier, parentURL) {
      const resolved = __bundle.lookup(specifier, parentURL, 'require')

      if (resolved === null) {
        throw new Error(\`Cannot find module '\${specifier}' imported from '\${parentURL}'\`)
      }

      return resolved
    },
    addon(specifier = '.', parentURL) {
      const resolved = __bundle.lookup(specifier, parentURL, 'addon')

      if (resolved === null) {
        throw new Error(\`Cannot find addon '\${specifier}' imported from '\${parentURL}'\`)
      }

      return resolved
    },
    asset(specifier, parentURL) {
      const resolved = __bundle.lookup(specifier, parentURL, 'asset')

      if (resolved === null) {
        throw new Error(\`Cannot find asset '\${specifier}' imported from '\${parentURL}'\`)
      }

      return resolved
    },
    lookup(specifier, parentURL, condition) {
      const resolved = __bundle.imports[specifier] || __bundle.resolutions[parentURL]?.[specifier]

      const host = __bundle.builtinRequire?.addon?.host

      const conditions = [condition, 'bare', 'node', ...(host ? host.split('-') : [])]

      return __bundle.pick(resolved, conditions)
    },
    pick(resolved, conditions) {
      if (typeof resolved === 'string') return resolved

      if (typeof resolved !== 'object' || resolved === null) return null

      for (const [condition, target] of Object.entries(resolved)) {
        if (condition !== 'default' && !conditions.includes(condition)) continue

        const picked = __bundle.pick(target, conditions)

        if (picked !== null) return picked
      }

      return null
    }
  }

  __bundle.load(Object.create(null), ${JSON.stringify(bundle.main)})
}`
}

function compileModule(key, source) {
  if (key.endsWith('.json')) {
    return `module.exports = ${source}`
  }

  if (key.endsWith('.bin')) {
    return `module.exports = new Uint8Array([${Array.from(source)}])`
  }

  if (key.endsWith('.txt')) {
    return `module.exports = ${JSON.stringify(source.toString())}`
  }

  return source
}
