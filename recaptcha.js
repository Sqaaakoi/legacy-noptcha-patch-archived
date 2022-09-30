;(async () => {
  class _ {
    static time () {
      return Date.now || (Date.now = () => new Date().getTime()), Date.now()
    }
    static sleep (t = 1e3) {
      return new Promise(e => setTimeout(e, t))
    }
    static async random_sleep (e, t) {
      t = Math.floor(Math.random() * (t - e) + e)
      return _.sleep(t)
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
        (e = e || _.date()),
        _.pad(e.getMonth() + 1) +
          `/${_.pad(e.getDate())}/${e.getFullYear()} ${_.pad(
            e.getHours() % 12
          )}:${_.pad(e.getMinutes())}:${_.pad(e.getSeconds())} ` +
          (12 <= e.getHours() ? 'PM' : 'AM')
      )
    }
  }
  class g {
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
  class d {
    static async fetch (e, t) {
      return g.exec('fetch', { url: e, options: t })
    }
  }
  class m {
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
      key: c
    }) {
      for (
        var i = Date.now(), n = await g.exec('info_tab');
        !(Date.now() - i > 1e3 * m.MAX_WAIT_POST);

      ) {
        const u = {
          type: e,
          task: t,
          image_urls: a,
          v: chrome.runtime.getManifest().version,
          key: c,
          url: n.url
        }
        r && (u.grid = r)
        var l = await d.fetch(m.INFERENCE_URL, {
          method: 'POST',
          body: JSON.stringify(u),
          headers: { 'Content-Type': 'application/json' }
        })
        try {
          var s = JSON.parse(l)
          if ('error' in s) {
            if (s.error === m.ERRORS.RATE_LIMITED) {
              await _.sleep(2e3)
              continue
            }
            if (s.error === m.ERRORS.INVALID_KEY) break
            if (s.error === m.ERRORS.NO_CREDIT) break
            break
          }
          var o = 'id' in s ? s.id : s.data
          return await m.get({ job_id: o, key: c })
        } catch (e) {
          break
        }
      }
      return { job_id: null, clicks: null }
    }
    static async get ({ key: e, job_id: t }) {
      for (var a = Date.now(); !(Date.now() - a > 1e3 * m.MAX_WAIT_GET); ) {
        await _.sleep(500)
        var r = await d.fetch(m.INFERENCE_URL + `?id=${t}&key=` + e)
        try {
          var c = JSON.parse(r)
          if ('error' in c) {
            if (c.error !== m.ERRORS.INCOMPLETE_JOB)
              return { job_id: t, clicks: null }
            continue
          }
          return { job_id: t, clicks: c.data }
        } catch (e) {
          break
        }
      }
      return { job_id: t, clicks: null }
    }
  }
  function a () {
    var e =
        'true' ===
        document
          .querySelector('.recaptcha-checkbox')
          ?.getAttribute('aria-checked'),
      t = document.querySelector('#recaptcha-verify-button')?.disabled
    return e || t
  }
  function y (c = 15e3) {
    return new Promise(async e => {
      for (var t = _.time(); ; ) {
        var a = document.querySelectorAll('.rc-imageselect-tile'),
          r = document.querySelectorAll('.rc-imageselect-dynamic-selected')
        if (0 < a.length && 0 === r.length) return e(true)
        if (_.time() - t > c) return e(false)
        await _.sleep(100)
      }
    })
  }
  async function w (e) {
    let t = null
    if (
      !(t =
        1 < e.length
          ? (t = e.slice(0, 2).join(' ')).replace(/\s+/g, ' ')?.trim()
          : t.join('\n'))
    )
      return null
    e = (function () {
      let e = window.navigator.userLanguage || window.navigator.language
      return e ? (e = (e = e.toLowerCase()).split('-')[0]) : null
    })()
    return (t =
      e && 'en' !== e
        ? await g.exec('translate', { from: e, to: 'en', text: t })
        : t)
  }
  let v = null
  async function e (e) {
    if (a())
      return (r = r || true), void (e.debug && (await g.exec('reset_recaptcha')))
    ;(r = false),
      await _.sleep(e.recaptcha_open_delay),
      document.querySelector('#recaptcha-anchor')?.click()
  }
  async function t (r) {
    r.debug && (await g.exec('reload_tab', { delay: 3e5, overwrite: true }))
    var c = await g.exec('get_cache', {
      name: 'recaptcha_visible',
      tab_specific: true
    })
    if (true === c && !a()) {
      if (
        ((b =
          !(
            b ||
            !(function () {
              for (const e of ['.rc-imageselect-incorrect-response'])
                if ('' === document.querySelector(e)?.style.display) return 1
            })()
          ) && ((E = []), true)),
        (function () {
          for (const e of [
            '.rc-imageselect-error-select-more',
            '.rc-imageselect-error-dynamic-more',
            '.rc-imageselect-error-select-something'
          ])
            if ('' === document.querySelector(e)?.style.display) return 1
        })())
      )
        return (E = []), void (await g.exec('reset_recaptcha'))
      if (await y()) {
        t = 100
        var t,
          {
            task: c,
            is_hard: i,
            cells: n,
            background_url: l,
            urls: s
          } = await new Promise(d => {
            let f = false
            const h = setInterval(async () => {
              if (!f) {
                f = true
                var r = document
                    .querySelector('.rc-imageselect-instructions')
                    ?.innerText?.split('\n'),
                  c = await w(r)
                if (c) {
                  var r = 3 === r.length,
                    i = document.querySelectorAll('table tr td')
                  if (9 !== i.length && 16 !== i.length) f = false
                  else {
                    const s = [],
                      o = Array(i.length).fill(null)
                    let e = null,
                      t = false,
                      a = 0
                    for (const u of i) {
                      var n = u?.querySelector('img')
                      if (!n) return void (f = false)
                      var l = n?.src?.trim()
                      if (!l || '' === l) return void (f = false)
                      300 <= n.naturalWidth
                        ? (e = l)
                        : 100 == n.naturalWidth && ((o[a] = l), (t = true)),
                        s.push(u),
                        a++
                    }
                    t && (e = null)
                    i = JSON.stringify([e, o])
                    if (v !== i)
                      return (
                        (v = i),
                        clearInterval(h),
                        (f = false),
                        d({
                          task: c,
                          is_hard: r,
                          cells: s,
                          background_url: e,
                          urls: o
                        })
                      )
                    f = false
                  }
                } else f = false
              }
            }, t)
          }),
          o = 9 == n.length ? 3 : 4
        const h = []
        let e,
          a = []
        if (null === l) {
          e = '1x1'
          for (let e = 0; e < s.length; e++) {
            var u = s[e],
              d = n[e]
            u && !E.includes(u) && (h.push(u), a.push(d))
          }
        } else h.push(l), (e = o + 'x' + o), (a = n)
        var l = _.time(),
          f = (
            await m.post({
              captcha_type: 'recaptcha',
              task: c,
              image_urls: h,
              grid: e,
              key: r.key
            })
          )['clicks']
        if (f) {
          c = r.recaptcha_solve_delay - (_.time() - l)
          0 < c && (await _.sleep(c))
          let t = 0
          for (let e = 0; e < f.length; e++)
            false !== f[e] &&
              (t++,
              (function (e) {
                try {
                  return e.classList.contains('rc-imageselect-tileselected')
                } catch {}
              })(a[e]) || a[e]?.click())
          for (const p of s) E.push(p), 9 < E.length && E.shift()
          ;((3 == o && i && 0 === t && (await y())) ||
            (3 == o && !i) ||
            4 == o) &&
            document.querySelector('#recaptcha-verify-button')?.click()
        }
      } else await g.exec('reset_recaptcha')
    }
  }
  let r = false,
    b = false,
    E = []
  for (;;) {
    await _.sleep(1e3)
    var c = await g.exec('get_settings')
    c &&
      'image' === c.recaptcha_solve_method &&
      (!(async function () {
        var t = document.querySelectorAll('iframe[src*="/bframe"]')
        if (0 < t.length) {
          let e = false
          for (const a of t)
            if ((e = 'visible' === window.getComputedStyle(a).visibility)) break
          e
            ? await g.exec('set_cache', {
                name: 'recaptcha_visible',
                value: true,
                tab_specific: true
              })
            : await g.exec('set_cache', {
                name: 'recaptcha_visible',
                value: false,
                tab_specific: true
              })
        }
      })(),
      c.recaptcha_auto_open &&
      null !== document.querySelector('.recaptcha-checkbox')
        ? await e(c)
        : c.recaptcha_auto_solve &&
          null !== document.querySelector('#rc-imageselect') &&
          (await t(c)))
  }
})()
