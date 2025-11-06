const cjs = require('./lib/cjs')
const esm = require('./lib/esm')

module.exports = exports = function compile(bundle, opts = {}) {
  const { type = 'script' } = opts

  switch (type) {
    case 'script':
    default:
      return cjs(bundle)
    case 'module':
      return esm(bundle)
  }
}

exports.cjs = cjs
exports.esm = esm
