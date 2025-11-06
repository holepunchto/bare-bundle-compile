const cjs = require('./lib/cjs')
const esm = require('./lib/esm')

const constants = {
  SCRIPT: 1,
  MODULE: 2
}

module.exports = exports = function compile(bundle, opts = {}) {
  const { type = constants.SCRIPT } = opts

  switch (type) {
    case constants.SCRIPT:
    default:
      return cjs(bundle)
    case constants.MODULE:
      return esm(bundle)
  }
}

exports.constants = constants
