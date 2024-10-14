module.exports = function compile (bundle) {
  return (
`{
  const __bundle__ = {
    builtinRequire: typeof require === 'function' ? require : null,
    cache: Object.create(null),
    files: {${[...bundle].map(([key, source]) => `
      ${JSON.stringify(key)}: {
        imports: ${JSON.stringify(bundle.resolutions[key] || {})},
        source: (require, module, exports, __filename, __dirname) => {${key.endsWith('.json') ? 'module.exports = ' + source : source}}
      }`).join(',')}
    },
    require: (filename) => {
      let module = __bundle__.cache[filename]
      if (module) return module

      const file = __bundle__.files[filename]
      if (!file) throw new Error(\`Cannot find module '\${filename}'\`)

      module = __bundle__.cache[filename] = {
        exports: {},
        filename,
        dirname: filename.slice(0, filename.lastIndexOf('/')) || '/'
      }

      function require (specifier) {
        return __bundle__.require(require.resolve(specifier)).exports
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
        if (!__bundle__.builtinRequire || !__bundle__.builtinRequire.addon) {
          throw new Error('Cannot load addons')
        }

        const resolved = file.imports[specifier]

        if (!resolved || (typeof resolved === 'object' && !resolved.addon)) {
          throw new Error(\`Cannot find addon '\${specifier}' imported from '\${module.filename}'\`)
        }

        return __bundle__.builtinRequire.addon(typeof resolved === 'object' ? resolved.addon : resolved)
      }

      file.source(require, module, module.exports, module.filename, module.dirname)

      return module
    }
  }

  __bundle__.require(${JSON.stringify(bundle.main)})
}`
  )
}
