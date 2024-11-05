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

test('require.addon()', (t) => {
  const bundle = new Bundle()
    .write('/foo.js', 'module.exports = require.addon()', {
      main: true,
      imports: {
        '.': {
          addon: '/foo.bare'
        }
      }
    })

  const require = () => {}

  require.addon = (specifier) => {
    t.is(specifier, '/foo.bare')

    return 'addon'
  }

  t.is(eval(compile(bundle)).exports, 'addon')
})

test('require.addon(\'id\')', (t) => {
  const bundle = new Bundle()
    .write('/foo.js', 'module.exports = require.addon(\'.\')', {
      main: true,
      imports: {
        '.': {
          addon: '/foo.bare'
        }
      }
    })

  const require = () => {}

  require.addon = (specifier) => {
    t.is(specifier, '/foo.bare')

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
