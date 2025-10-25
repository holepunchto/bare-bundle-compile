const test = require('brittle')
const Bundle = require('bare-bundle')
const compile = require('.')

test("require('id')", (t) => {
  const bundle = new Bundle()
    .write('/foo.js', "module.exports = require('./bar')", {
      main: true,
      imports: {
        './bar': '/bar.js'
      }
    })
    .write('/bar.js', 'module.exports = 42')

  t.is(eval(compile(bundle)).exports, 42)
})

test("circular require('id')", (t) => {
  const bundle = new Bundle()
    .write('/foo.js', "module.exports = require('./bar')", {
      main: true,
      imports: {
        './bar': '/bar.js'
      }
    })
    .write('/bar.js', "module.exports = 42; require('./foo')", {
      imports: {
        './foo': '/foo.js'
      }
    })

  t.is(eval(compile(bundle)).exports, 42)
})

test("require('id'), globally preresolved", (t) => {
  const bundle = new Bundle()
    .write('/foo.js', "module.exports = require('./bar')", {
      main: true
    })
    .write('/baz.js', 'module.exports = 42')

  bundle.imports = {
    './bar': '/baz.js'
  }

  t.is(eval(compile(bundle)).exports, 42)
})

test('require.addon()', (t) => {
  const bundle = new Bundle().write('/binding.js', 'module.exports = require.addon()', {
    main: true,
    imports: {
      '.': {
        addon: '/addon.bare'
      }
    }
  })

  const require = () => {
    t.fail()
  }

  require.addon = (specifier) => {
    t.is(specifier, '/addon.bare')

    return 'addon'
  }

  t.is(eval(compile(bundle)).exports, 'addon')
})

test("require.addon('id')", (t) => {
  const bundle = new Bundle().write('/binding.js', "module.exports = require.addon('.')", {
    main: true,
    imports: {
      '.': {
        addon: '/addon.bare'
      }
    }
  })

  const require = () => {
    t.fail()
  }

  require.addon = (specifier) => {
    t.is(specifier, '/addon.bare')

    return 'addon'
  }

  t.is(eval(compile(bundle)).exports, 'addon')
})

test("require.addon('id', referrer)", (t) => {
  const bundle = new Bundle()
    .write('/a/binding.js', "module.exports = require('../b')('.', __filename)", {
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
    .write(
      '/b/index.js',
      'module.exports = (specifier, referrer) => require.addon(specifier, referrer)'
    )

  const require = () => {
    t.fail()
  }

  require.addon = (specifier) => {
    t.is(specifier, '/addon.bare')

    return 'addon'
  }

  t.is(eval(compile(bundle)).exports, 'addon')
})

test('require.addon.resolve()', (t) => {
  const bundle = new Bundle().write('/binding.js', 'module.exports = require.addon.resolve()', {
    main: true,
    imports: {
      '.': {
        addon: '/addon.bare'
      }
    }
  })

  const require = () => {
    t.fail()
  }

  require.addon = () => {
    t.fail()
  }

  t.is(eval(compile(bundle)).exports, '/addon.bare')
})

test("require.addon.resolve('id')", (t) => {
  const bundle = new Bundle().write('/binding.js', "module.exports = require.addon.resolve('.')", {
    main: true,
    imports: {
      '.': {
        addon: '/addon.bare'
      }
    }
  })

  const require = () => {
    t.fail()
  }

  require.addon = () => {
    t.fail()
  }

  t.is(eval(compile(bundle)).exports, '/addon.bare')
})

test("require.addon.resolve('id', referrer)", (t) => {
  const bundle = new Bundle()
    .write('/a/binding.js', "module.exports = require('../b')('.', __filename)", {
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
    .write(
      '/b/index.js',
      'module.exports = (specifier, referrer) => require.addon.resolve(specifier, referrer)'
    )

  const require = () => {
    t.fail()
  }

  require.addon = () => {
    t.fail()
  }

  t.is(eval(compile(bundle)).exports, '/addon.bare')
})

test('require.addon.host', (t) => {
  const bundle = new Bundle().write('/binding.js', 'module.exports = require.addon.host', {
    main: true,
    imports: {}
  })

  const require = () => {
    t.fail()
  }

  require.addon = () => {
    t.fail()
  }

  require.addon.host = 'unknown'

  t.is(eval(compile(bundle)).exports, 'unknown')
})

test("require.asset('id')", (t) => {
  const bundle = new Bundle().write('/foo.js', "module.exports = require.asset('./bar.txt')", {
    main: true,
    imports: {
      './bar.txt': {
        asset: '/baz.txt'
      }
    }
  })

  t.is(eval(compile(bundle)).exports, '/baz.txt')
})

test("require.asset('id', referrer)", (t) => {
  const bundle = new Bundle()
    .write('/a/foo.js', "module.exports = require('../b')('./bar.txt', __filename)", {
      main: true,
      imports: {
        '../b': '/b/index.js',
        './bar.txt': {
          asset: '/a/baz.txt'
        }
      }
    })
    .write(
      '/b/index.js',
      'module.exports = (specifier, referrer) => require.asset(specifier, referrer)'
    )

  t.is(eval(compile(bundle)).exports, '/a/baz.txt')
})

test("require('builtin')", (t) => {
  const bundle = new Bundle().write('/foo.js', "module.exports = require('fs')", {
    main: true,
    imports: {
      fs: 'builtin:fs'
    }
  })

  const require = (specifier) => {
    t.is(specifier, 'fs')

    return 'fs'
  }

  require.addon = () => {
    t.fail()
  }

  t.is(eval(compile(bundle)).exports, 'fs')
})

test("require('.json')", (t) => {
  const bundle = new Bundle()
    .write('/foo.js', "module.exports = require('./bar.json')", {
      main: true,
      imports: {
        './bar.json': '/bar.json'
      }
    })
    .write('/bar.json', '{ "hello": "world" }')

  t.alike(eval(compile(bundle)).exports, {
    hello: 'world'
  })
})

test("require('.bin')", (t) => {
  const bundle = new Bundle()
    .write('/foo.js', "module.exports = require('./bar.bin')", {
      main: true,
      imports: {
        './bar.bin': '/bar.bin'
      }
    })
    .write('/bar.bin', 'Hello world')

  t.alike(eval(compile(bundle)).exports, Buffer.from('Hello world'))
})

test("require('.txt')", (t) => {
  const bundle = new Bundle()
    .write('/foo.js', "module.exports = require('./bar.txt')", {
      main: true,
      imports: {
        './bar.txt': '/bar.txt'
      }
    })
    .write('/bar.txt', 'Hello world')

  t.is(eval(compile(bundle)).exports, 'Hello world')
})

test("require('id', { with: { type: 'json' } })", (t) => {
  const bundle = new Bundle()
    .write('/foo.js', "module.exports = require('./bar.json', { with: { type: 'json' } })", {
      main: true,
      imports: {
        './bar.json': '/bar.json'
      }
    })
    .write('/bar.json', '{ "hello": "world" }')

  t.alike(eval(compile(bundle)).exports, {
    hello: 'world'
  })
})

test("require('id', { with: { type: 'binary' } })", (t) => {
  const bundle = new Bundle()
    .write('/foo.js', "module.exports = require('./bar.bin', { with: { type: 'binary' } })", {
      main: true,
      imports: {
        './bar.bin': '/bar.bin'
      }
    })
    .write('/bar.bin', 'Hello world')

  t.alike(eval(compile(bundle)).exports, Buffer.from('Hello world'))
})

test("require('id', { with: { type: 'text' } })", (t) => {
  const bundle = new Bundle()
    .write('/foo.js', "module.exports = require('./bar.txt', { with: { type: 'text' } })", {
      main: true,
      imports: {
        './bar.txt': '/bar.txt'
      }
    })
    .write('/bar.txt', 'Hello world')

  t.is(eval(compile(bundle)).exports, 'Hello world')
})

test("require('id', { with: { type: 'type' } }), asserted type mismatch", (t) => {
  const bundle = new Bundle()
    .write(
      '/foo.js',
      "require('./bar.txt', { with: { type: 'text' } }); require('./bar.txt', { with: { type: 'binary' } })",
      {
        main: true,
        imports: {
          './bar.txt': '/bar.txt'
        }
      }
    )
    .write('/bar.txt', 'Hello world')

  try {
    eval(compile(bundle))
    t.fail()
  } catch (err) {
    t.comment(err.message)
  }
})

test('mounted bundle', (t) => {
  const bundle = new Bundle()
    .write('/foo.js', "module.exports = require('./bar')", {
      main: true,
      imports: {
        './bar': '/bar.js'
      }
    })
    .write('/bar.js', 'module.exports = 42')
    .mount('file:///root/')

  const module = eval(compile(bundle))

  t.is(module.url, 'file:///root/foo.js')
  t.is(module.filename, '/root/foo.js')
  t.is(module.dirname, '/root')
})
