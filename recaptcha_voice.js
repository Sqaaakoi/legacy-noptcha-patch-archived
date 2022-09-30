;(async () => {
  class r {
    static time () {
      return Date.now || (Date.now = () => new Date().getTime()), Date.now()
    }
    static sleep (t = 1e3) {
      return new Promise(e => setTimeout(e, t))
    }
    static async random_sleep (e, t) {
      t = Math.floor(Math.random() * (t - e) + e)
      return r.sleep(t)
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
        (e = e || r.date()),
        r.pad(e.getMonth() + 1) +
          `/${r.pad(e.getDate())}/${e.getFullYear()} ${r.pad(
            e.getHours() % 12
          )}:${r.pad(e.getMinutes())}:${r.pad(e.getSeconds())} ` +
          (12 <= e.getHours() ? 'PM' : 'AM')
      )
    }
  }
  class n {
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
  class o {
    static async fetch (e, t) {
      return n.exec('fetch', { url: e, options: t })
    }
  }
  function i () {
    var e, t
    if (!l())
      return (
        (e =
          'true' ===
          document
            .querySelector('.recaptcha-checkbox')
            ?.getAttribute('aria-checked')),
        (t = document.querySelector('#recaptcha-verify-button')?.disabled),
        e || t
      )
  }
  function l () {
    return (
      'Try again later' ===
      document.querySelector('.rc-doscaptcha-header')?.innerText
    )
  }
  async function e (e) {
    i() ||
      (await r.sleep(e.recaptcha_open_delay),
      document.querySelector('#recaptcha-anchor')?.click())
  }
  async function t (t) {
    var a = await n.exec('get_cache', {
      name: 'recaptcha_visible',
      tab_specific: true
    })
    if (true === a && !i())
      if (l()) await n.exec('reset_recaptcha')
      else {
        ;(a = document.querySelector('.rc-audiochallenge-tdownload-link')
          ?.href),
          (a =
            (fetch(a),
            document
              .querySelector('#audio-source')
              ?.src?.replace('recaptcha.net', 'google.com')))
        let e = document
          .querySelector('html')
          ?.getAttribute('lang')
          ?.trim()
        ;(e && 0 !== e.length) || (e = 'en')
        var c = r.time(),
          a = await o.fetch('https://engageub.pythonanywhere.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'input=' + encodeURIComponent(a) + '&lang=' + e
          }),
          a =
            ((document.querySelector('#audio-response').value = a),
            t.recaptcha_solve_delay - (r.time() - c))
        0 < a && (await r.sleep(a)),
          document.querySelector('#recaptcha-verify-button')?.click()
      }
  }
  for (;;) {
    await r.sleep(1e3)
    var a = await n.exec('get_settings')
    a &&
      'voice' === a.recaptcha_solve_method &&
      ((async function () {
        var t = document.querySelectorAll(
          'iframe[src*="/recaptcha/api2/bframe"]'
        )
        if (0 < t.length) {
          let e = false
          for (const a of t)
            if ((e = 'visible' === window.getComputedStyle(a).visibility)) break
          e
            ? await n.exec('set_cache', {
                name: 'recaptcha_visible',
                value: true,
                tab_specific: true
              })
            : await n.exec('set_cache', {
                name: 'recaptcha_visible',
                value: false,
                tab_specific: true
              })
        }
      })(),
      a.recaptcha_auto_open &&
      null !== document.querySelector('.recaptcha-checkbox')
        ? await e(a)
        : a.recaptcha_auto_solve &&
          null !== document.querySelector('.rc-imageselect-instructions')
        ? ((c = a),
          await (true ===
            (await n.exec('get_cache', {
              name: 'recaptcha_visible',
              tab_specific: true
            })) &&
            !i() &&
            (await r.sleep(c.recaptcha_open_delay),
            !document.querySelector('#recaptcha-audio-button')?.click())))
        : !a.recaptcha_auto_solve ||
          (null === document.querySelector('#audio-instructions') &&
            null === document.querySelector('.rc-doscaptcha-header')) ||
          (await t(a)))
  }
  var c
})()
