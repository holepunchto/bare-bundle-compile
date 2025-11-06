const lex = require('bare-module-lexer')

module.exports = function compile(bundle) {
  const imports = Object.create(null)

  for (const [key, source] of bundle) {
    const resolutions = bundle.resolutions[key] || {}

    let compiled = compileModule(key, source)

    if (key.endsWith('.js') || key.endsWith('.mjs')) {
      let offset = 0

      for (const entry of lex(source).imports) {
        const {
          specifier,
          position: [, start, end]
        } = entry

        const resolved = resolutions[specifier] || null

        if (resolved === null) {
          throw new Error(`Cannot find module '${specifier}' imported from '${key}'`)
        }

        const replacement = toBase64(resolved)

        compiled =
          compiled.substring(0, offset + start) + replacement + compiled.substring(offset + end)

        offset += replacement.length - (end - start)
      }
    }

    imports[toBase64(key)] = `data:text/javascript;base64,${toBase64(compiled)}`
  }

  return {
    main: toBase64(bundle.main),
    imports
  }
}

function compileModule(key, source) {
  if (key.endsWith('.json')) {
    return `export default ${source}`
  }

  if (key.endsWith('.bin')) {
    return `export default new Uint8Array([${Array.from(source)}])`
  }

  if (key.endsWith('.txt')) {
    return `export default ${JSON.stringify(source.toString())}`
  }

  return source.toString()
}

function toBase64(string) {
  return buffer.from(string).toString('base64')
}
