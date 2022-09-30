'use strict'
class Type {
  static _string_constructor = 'string'.constructor
  static _array_constructor = [].constructor
  static _object_constructor = {}.constructor
  static of (e) {
    return null === e
      ? 'null'
      : void 0 === e
      ? 'undefined'
      : e.constructor === Type._string_constructor
      ? 'string'
      : e.constructor === Type._array_constructor
      ? 'array'
      : e.constructor === Type._object_constructor
      ? 'object'
      : ''
  }
}
class Logger {
  static debug = true
  static log (e = 0) {
    const t = new Array(...arguments).map(e =>
      ['array', 'object'].includes(Type.of(e))
        ? JSON.stringify(e, null, 4)
        : '' + e
    )
    t.join(' ')
  }
}
class Time {
  static time () {
    return Date.now || (Date.now = () => new Date().getTime()), Date.now()
  }
  static sleep (t = 1e3) {
    return new Promise(e => setTimeout(e, t))
  }
  static async random_sleep (e, t) {
    t = Math.floor(Math.random() * (t - e) + e)
    return Time.sleep(t)
  }
  static pad (e) {
    var t = 2 - String(e).length + 1
    return 0 < t ? '' + new Array(t).join('0') + e : '' + e
  }
  static date () {
    return new Date()
  }
  static string (e = null) {
    return (
      (e = e || Time.date()),
      Time.pad(e.getMonth() + 1) +
        `/${Time.pad(e.getDate())}/${e.getFullYear()} ${Time.pad(
          e.getHours() % 12
        )}:${Time.pad(e.getMinutes())}:${Time.pad(e.getSeconds())} ` +
        (12 <= e.getHours() ? 'PM' : 'AM')
    )
  }
}
class BG {
  static exec (e, r) {
    return new Promise(t => {
      try {
        chrome.runtime.sendMessage({ method: e, data: r }, t)
      } catch (e) {
        t()
      }
    })
  }
}
class Net {
  static async fetch (e, t) {
    return BG.exec('fetch', { url: e, options: t })
  }
}
class Image {
  static encode (t) {
    return new Promise(r => {
      if (null === t) return r(null)
      const e = new XMLHttpRequest()
      ;(e.onload = () => {
        const t = new FileReader()
        ;(t.onloadend = () => {
          let e = t.result
          if (e.startsWith('data:text/html;base64,')) return r(null)
          ;(e = e.replace('data:image/jpeg;base64,', '')), r(e)
        }),
          t.readAsDataURL(e.response)
      }),
        (e.onerror = () => {
          r(null)
        }),
        (e.onreadystatechange = () => {
          4 == this.readyState && 200 != this.status && r(null)
        }),
        e.open('GET', t),
        (e.responseType = 'blob'),
        e.send()
    })
  }
}
class NopeCHA {
  static INFERENCE_URL = 'https://api.nopecha.com'
  static MAX_WAIT_POST = 60
  static MAX_WAIT_GET = 60
  static ERRORS = {
    UNKNOWN: 9,
    INVALID_REQUEST: 10,
    RATE_LIIMTED: 11,
    BANNED_USER: 12,
    NO_JOB: 13,
    INCOMPLETE_JOB: 14,
    INVALID_KEY: 15,
    NO_CREDIT: 16,
    UPDATE_REQUIRED: 17
  }
  static async post ({
    captcha_type: e,
    task: t,
    image_urls: r,
    grid: a,
    key: n
  }) {
    for (
      var o = Date.now(), s = await BG.exec('info_tab');
      !(Date.now() - o > 1e3 * NopeCHA.MAX_WAIT_POST);

    ) {
      const u = {
        type: e,
        task: t,
        image_urls: r,
        v: chrome.runtime.getManifest().version,
        key: n,
        url: s.url
      }
      a && (u.grid = a)
      var i = await Net.fetch(NopeCHA.INFERENCE_URL, {
        method: 'POST',
        body: JSON.stringify(u),
        headers: { 'Content-Type': 'application/json' }
      })
      try {
        var c = JSON.parse(i)
        if ('error' in c) {
          if (c.error === NopeCHA.ERRORS.RATE_LIMITED) {
            await Time.sleep(2e3)
            continue
          }
          if (c.error === NopeCHA.ERRORS.INVALID_KEY) break
          if (c.error === NopeCHA.ERRORS.NO_CREDIT) break
          break
        }
        var l = 'id' in c ? c.id : c.data
        return await NopeCHA.get({ job_id: l, key: n })
      } catch (e) {
        break
      }
    }
    return { job_id: null, clicks: null }
  }
  static async get ({ key: e, job_id: t }) {
    for (var r = Date.now(); !(Date.now() - r > 1e3 * NopeCHA.MAX_WAIT_GET); ) {
      await Time.sleep(500)
      var a = await Net.fetch(NopeCHA.INFERENCE_URL + `?id=${t}&key=` + e)
      try {
        var n = JSON.parse(a)
        if ('error' in n) {
          if (n.error !== NopeCHA.ERRORS.INCOMPLETE_JOB)
            return { job_id: t, clicks: null }
          continue
        }
        return { job_id: t, clicks: n.data }
      } catch (e) {
        break
      }
    }
    return { job_id: t, clicks: null }
  }
}
function oep (a, n = 1, e = 100) {
  return new Promise(t => {
    const r = setInterval(() => {
      var e = document.querySelectorAll(a)
      if (e.length === n) return clearInterval(r), t(1 === n ? e[0] : e)
    }, e)
  })
}
export { Type, Logger, Time, BG, Net, Image, NopeCHA, oep }
