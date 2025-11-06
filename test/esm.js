const test = require('brittle')
const Bundle = require('bare-bundle')
const compile = require('..')
const { b64, uri } = require('./helpers')

test("import 'id'", (t) => {
  const bundle = new Bundle()
    .write('/foo.js', "import './bar'", {
      main: true,
      imports: {
        './bar': '/bar.js'
      }
    })
    .write('/bar.js', 'export default 42')

  t.alike(compile(bundle, { type: 'module' }), {
    main: b64('/foo.js'),
    imports: {
      [b64('/foo.js')]: uri(`import '${b64('/bar.js')}'`),
      [b64('/bar.js')]: uri(`export default 42`)
    }
  })
})

test("import 'id', multiple imports", (t) => {
  const bundle = new Bundle()
    .write('/foo.js', "import './bar', import './baz'", {
      main: true,
      imports: {
        './bar': '/bar.js',
        './baz': '/baz.js'
      }
    })
    .write('/bar.js', 'export default 42')
    .write('/baz.js', 'export default 42')

  t.alike(compile(bundle, { type: 'module' }), {
    main: b64('/foo.js'),
    imports: {
      [b64('/foo.js')]: uri(`import '${b64('/bar.js')}', import '${b64('/baz.js')}'`),
      [b64('/bar.js')]: uri(`export default 42`),
      [b64('/baz.js')]: uri(`export default 42`)
    }
  })
})

test("import 'id', mounted bundle", (t) => {
  const bundle = new Bundle()
    .write('/foo.js', "import './bar'", {
      main: true,
      imports: {
        './bar': '/bar.js'
      }
    })
    .write('/bar.js', 'export default 42')
    .mount('file:///root/')

  t.alike(compile(bundle, { type: 'module' }), {
    main: b64('file:///root/foo.js'),
    imports: {
      [b64('file:///root/foo.js')]: uri(`import '${b64('file:///root/bar.js')}'`),
      [b64('file:///root/bar.js')]: uri(`export default 42`)
    }
  })
})

test("import 'id', not found", (t) => {
  const bundle = new Bundle().write('/foo.js', "import './bar'", {
    main: true
  })

  try {
    compile(bundle, { type: 'module' })
    t.fail()
  } catch (err) {
    t.comment(err.message)
  }
})

test("circular import 'id'", (t) => {
  const bundle = new Bundle()
    .write('/foo.js', "import './bar'", {
      main: true,
      imports: {
        './bar': '/bar.js'
      }
    })
    .write('/bar.js', "import './foo'", {
      imports: {
        './foo': '/foo.js'
      }
    })

  t.alike(compile(bundle, { type: 'module' }), {
    main: b64('/foo.js'),
    imports: {
      [b64('/foo.js')]: uri(`import '${b64('/bar.js')}'`),
      [b64('/bar.js')]: uri(`import '${b64('/foo.js')}'`)
    }
  })
})
