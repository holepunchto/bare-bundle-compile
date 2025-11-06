const test = require('brittle')
const Bundle = require('bare-bundle')
const compile = require('..')
const { b64, uri } = require('./helpers')

const { MODULE } = compile.constants

test("import 'id'", (t) => {
  const bundle = new Bundle()
    .write('/foo.js', "import './bar'", {
      main: true,
      imports: {
        './bar': '/bar.js'
      }
    })
    .write('/bar.js', 'export default 42')

  t.alike(compile(bundle, { type: MODULE }), {
    main: b64('/foo.js'),
    imports: {
      [b64('/foo.js')]: uri(`import '${b64('/bar.js')}'`),
      [b64('/bar.js')]: uri(`export default 42`)
    }
  })
})
