;(async () => {
  class d {
    static time () {
      return Date.now || (Date.now = () => new Date().getTime()), Date.now()
    }
    static sleep (t = 1e3) {
      return new Promise(e => setTimeout(e, t))
    }
    static async random_sleep (e, t) {
      t = Math.floor(Math.random() * (t - e) + e)
      return d.sleep(t)
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
        (e = e || d.date()),
        d.pad(e.getMonth() + 1) +
          `/${d.pad(e.getDate())}/${e.getFullYear()} ${d.pad(
            e.getHours() % 12
          )}:${d.pad(e.getMinutes())}:${d.pad(e.getSeconds())} ` +
          (12 <= e.getHours() ? 'PM' : 'AM')
      )
    }
  }
  class p {
    static exec (e, a) {
      return new Promise(t => {
        try {
          chrome.runtime.sendMessage({ method: e, data: a }, t)
        } catch (e) {
          t()
        }
      })
    }
  }
  class h {
    static async fetch (e, t) {
      return p.exec('fetch', { url: e, options: t })
    }
  }
  class g {
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
      image_urls: a,
      grid: r,
      key: n
    }) {
      for (
        var i = Date.now(), c = await p.exec('info_tab');
        !(Date.now() - i > 1e3 * g.MAX_WAIT_POST);

      ) {
        const u = {
          type: e,
          task: t,
          image_urls: a,
          v: chrome.runtime.getManifest().version,
          key: n,
          url: c.url
        }
        r && (u.grid = r)
        var o = await h.fetch(g.INFERENCE_URL, {
          method: 'POST',
          body: JSON.stringify(u),
          headers: { 'Content-Type': 'application/json' }
        })
        try {
          var s = JSON.parse(o)
          if ('error' in s) {
            if (s.error === g.ERRORS.RATE_LIMITED) {
              await d.sleep(2e3)
              continue
            }
            if (s.error === g.ERRORS.INVALID_KEY) break
            if (s.error === g.ERRORS.NO_CREDIT) break
            break
          }
          var l = 'id' in s ? s.id : s.data
          return await g.get({ job_id: l, key: n })
        } catch (e) {
          break
        }
      }
      return { job_id: null, clicks: null }
    }
    static async get ({ key: e, job_id: t }) {
      for (var a = Date.now(); !(Date.now() - a > 1e3 * g.MAX_WAIT_GET); ) {
        await d.sleep(500)
        var r = await h.fetch(g.INFERENCE_URL + `?id=${t}&key=` + e)
        try {
          var n = JSON.parse(r)
          if ('error' in n) {
            if (n.error !== g.ERRORS.INCOMPLETE_JOB)
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
  function u (e) {
    const t = e?.style.background?.trim()?.match(/(?!^)".*?"/g)
    return t && 0 !== t.length ? t[0].replaceAll('"', '') : null
  }
  async function y () {
    let e = document
      .querySelector('h2.prompt-text')
      ?.innerText?.replace(/\s+/g, ' ')
      ?.trim()
    if (!e) return null
    var t = {
      '0430': 'a',
      '0441': 'c',
      '0501': 'd',
      '0435': 'e',
      '04bb': 'h',
      '0456': 'i',
      '0458': 'j',
      '04cf': 'l',
      '03bf': 'o',
      '043e': 'o',
      '0440': 'p',
      '0455': 's',
      '0445': 'x',
      '0443': 'y',
      '0065': 'e',
      '0069': 'i',
      '30fc': '一',
      '571f': '士'
    }
    const a = []
    for (const i of e) {
      var r = (function (e, t, a) {
        for (; ('' + e).length < a; ) e = '' + t + e
        return e
      })(i.charCodeAt(0).toString(16), '0', 4)
      r in t ? a.push(t[r]) : a.push(i)
    }
    e = a.join('')
    var n = (function () {
      let e =
        document.querySelector('.display-language .text').innerText ||
        window.navigator.userLanguage ||
        window.navigator.language
      return e ? (e = (e = e.toLowerCase()).split('-')[0]) : null
    })()
    return (e =
      n && 'en' !== n
        ? await p.exec('translate', { from: n, to: 'en', text: e })
        : e)
  }
  let f = null
  async function e (e) {
    if ('block' === document.querySelector('div.check')?.style.display)
      return (a = a || true), void (e.debug && window.location.reload())
    ;(a = false),
      await d.sleep(e.hcaptcha_open_delay),
      document.querySelector('#checkbox')?.click()
  }
  async function t (e) {
    o = !(
      o ||
      !(function () {
        const e = document.querySelector('.display-error')
        return 'true' !== e?.getAttribute('aria-hidden')
      })()
    )
    n = 100
    const { task: t, cells: a, urls: r } = await new Promise(o => {
      let s = false
      const l = setInterval(async () => {
        if (!s) {
          s = true
          var e = await y()
          if (e) {
            var t = document.querySelector(
                '.challenge-example > .image > .image'
              ),
              t = u(t)
            if (t && '' !== t) {
              var a = document.querySelectorAll('.task-image')
              if (9 !== a.length) s = false
              else {
                const n = [],
                  i = []
                for (const c of a) {
                  var r = c.querySelector('div.image')
                  if (!r) return void (s = false)
                  r = u(r)
                  if (!r || '' === r) return void (s = false)
                  n.push(c), i.push(r)
                }
                a = JSON.stringify(i)
                if (f !== a)
                  return (
                    (f = a),
                    clearInterval(l),
                    (s = false),
                    o({ task: e, task_url: t, cells: n, urls: i })
                  )
                s = false
              }
            } else s = false
          } else s = false
        }
      }, n)
    })
    var n,
      i = d.time(),
      c = (
        await g.post({
          captcha_type: 'hcaptcha',
          task: t,
          image_urls: r,
          key: e.key
        })
      )['clicks']
    if (c) {
      e = e.hcaptcha_solve_delay - (d.time() - i)
      0 < e && (await d.sleep(e))
      for (let e = 0; e < c.length; e++)
        false !== c[e] &&
          'true' !== a[e].getAttribute('aria-pressed') &&
          a[e].click()
      try {
        document.querySelector('.button-submit').click()
      } catch (e) {}
    }
  }
  let a = false,
    o = false
  for (;;) {
    await d.sleep(1e3)
    var r = await p.exec('get_settings')
    r &&
      (r.hcaptcha_auto_open && null !== document.querySelector('div.check')
        ? await e(r)
        : r.hcaptcha_auto_solve &&
          null !== document.querySelector('h2.prompt-text') &&
          (await t(r)))
  }
})()
