exports.b64 = function b64(string) {
  return Buffer.from(string).toString('base64')
}

exports.uri = function uri(string, opts = {}) {
  const { type = 'text/javascript', encoding = 'base64' } = opts

  return `data:${type};${encoding},${Buffer.from(string).toString(encoding)}`
}
