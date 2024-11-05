/* eslint-disable no-eval */
const test = require('brittle')
const Bundle = require('bare-bundle')
const compile = require('.')

test('require(\'id\')', (t) => {
  const bundle = new Bundle()
    .write('/foo.js', 'module.exports = require(\'./bar\')', {
      main: true,
      imports: {
        './bar': '/bar.js'
      }
    })
    .write('/bar.js', 'module.exports = 42')

  t.is(eval(compile(bundle)).exports, 42)
})

test('circular require(\'id\')', (t) => {
  const bundle = new Bundle()
    .write('/foo.js', 'module.exports = require(\'./bar\')', {
      main: true,
      imports: {
        './bar': '/bar.js'
      }
    })
    .write('/bar.js', 'module.exports = 42; require(\'./foo\')', {
      imports: {
        './foo': '/foo.js'
      }
    })

  t.is(eval(compile(bundle)).exports, 42)
})

test('require.addon()', (t) => {
  const bundle = new Bundle()
    .write('/binding.js', 'module.exports = require.addon()', {
      main: true,
      imports: {
        '.': {
          addon: '/addon.bare'
        }
      }
    })

  const require = () => {}

  require.addon = (specifier) => {
    t.is(specifier, '/addon.bare')

    return 'addon'
  }

  t.is(eval(compile(bundle)).exports, 'addon')
})

test('require.addon(\'id\')', (t) => {
  const bundle = new Bundle()
    .write('/binding.js', 'module.exports = require.addon(\'.\')', {
      main: true,
      imports: {
        '.': {
          addon: '/addon.bare'
        }
      }
    })

  const require = () => {}

  require.addon = (specifier) => {
    t.is(specifier, '/addon.bare')

    return 'addon'
  }

  t.is(eval(compile(bundle)).exports, 'addon')
})

test('require.addon(\'id\', referrer)', (t) => {
  const bundle = new Bundle()
    .write('/a/binding.js', 'module.exports = require(\'../b\')(\'.\', __filename)', {
      main: true,
      imports: {
        '#package': '/a/package.json',
        '../b': '/b/index.js',
        '.': {
          addon: '/addon.bare'
        }
      }
    })
    .write('/a/package.json', '{ "name": "addon", "addon": true }')
    .write('/b/index.js', 'module.exports = (specifier, referrer) => require.addon(specifier, referrer)')

  const require = () => {}

  require.addon = (specifier) => {
    t.is(specifier, '/addon.bare')

    return 'addon'
  }

  t.is(eval(compile(bundle)).exports, 'addon')
})

test('require.asset(\'id\')', (t) => {
  const bundle = new Bundle()
    .write('/foo.js', 'module.exports = require.asset(\'./bar.txt\')', {
      main: true,
      imports: {
        './bar.txt': {
          asset: '/baz.txt'
        }
      }
    })

  t.is(eval(compile(bundle)).exports, '/baz.txt')
})

test('require.asset(\'id\', referrer)', (t) => {
  const bundle = new Bundle()
    .write('/a/foo.js', 'module.exports = require(\'../b\')(\'./bar.txt\', __filename)', {
      main: true,
      imports: {
        '../b': '/b/index.js',
        './bar.txt': {
          asset: '/a/baz.txt'
        }
      }
    })
    .write('/b/index.js', 'module.exports = (specifier, referrer) => require.asset(specifier, referrer)')

  t.is(eval(compile(bundle)).exports, '/a/baz.txt')
})

test('require(\'builtin\')', (t) => {
  const bundle = new Bundle()
    .write('/foo.js', 'module.exports = require(\'fs\')', {
      main: true,
      imports: {
        fs: 'builtin:fs'
      }
    })

  const require = (specifier) => { // eslint-disable-line no-unused-vars
    t.is(specifier, 'fs')

    return 'fs'
  }

  t.is(eval(compile(bundle)).exports, 'fs')
})
