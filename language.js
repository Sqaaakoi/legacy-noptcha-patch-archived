;(() => {
  var e = 'en-US'
  Object.defineProperties(Navigator.prototype, {
    language: { value: e, configurable: false, enumerable: true, writable: false },
    languages: { value: [e], configurable: false, enumerable: true, writable: false }
  })
})()
