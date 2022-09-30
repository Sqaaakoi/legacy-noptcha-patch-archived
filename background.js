;(() => {
  function t (t) {
    return JSON.parse(JSON.stringify(t))
  }
  class s {
    static cache = {}
    static async set ({
      tab_id: t,
      data: { name: a, value: e, tab_specific: c }
    }) {
      return c && (a = t + '_' + a), (s.cache[a] = e), s.cache[a]
    }
    static async get ({ tab_id: t, data: { name: a, tab_specific: e } }) {
      return e && (a = t + '_' + a), s.cache[a]
    }
    static async remove ({ tab_id: t, data: { name: a, tab_specific: e } }) {
      e && (a = t + '_' + a)
      e = s.cache[a]
      return delete s.cache[a], e
    }
    static async append ({
      tab_id: t,
      data: { name: a, value: e, tab_specific: c }
    }) {
      return (
        (a = c ? t + '_' + a : a) in s.cache || (s.cache[a] = []),
        s.cache[a].push(e),
        s.cache[a]
      )
    }
    static async empty ({ tab_id: t, data: { name: a, tab_specific: e } }) {
      e && (a = t + '_' + a)
      e = s.cache[a]
      return (s.cache[a] = []), e
    }
    static async inc ({ tab_id: t, data: { name: a, tab_specific: e } }) {
      return (
        (a = e ? t + '_' + a : a) in s.cache || (s.cache[a] = 0),
        s.cache[a]++,
        s.cache[a]
      )
    }
    static async dec ({ tab_id: t, data: { name: a, tab_specific: e } }) {
      return (
        (a = e ? t + '_' + a : a) in s.cache || (s.cache[a] = 0),
        s.cache[a]--,
        s.cache[a]
      )
    }
    static async zero ({ tab_id: t, data: { name: a, tab_specific: e } }) {
      return e && (a = t + '_' + a), (s.cache[a] = 0), s.cache[a]
    }
  }
  class n {
    static reloads = {}
    static _reload ({ tab_id: a }) {
      return new Promise(t => chrome.tabs.reload(a, { bypassCache: true }, t))
    }
    static async reload ({
      tab_id: t,
      data: { delay: a, overwrite: e } = { delay: 0, overwrite: true }
    }) {
      a = parseInt(a)
      let c = n.reloads[t]?.delay - (Date.now() - n.reloads[t]?.start)
      return (
        (c = isNaN(c) || c < 0 ? 0 : c),
        !!(e || 0 == c || a <= c) &&
          (clearTimeout(n.reloads[t]?.timer),
          (n.reloads[t] = {
            delay: a,
            start: Date.now(),
            timer: setTimeout(() => n._reload({ tab_id: t }), a)
          }),
          true)
      )
    }
    static close ({ tab_id: a }) {
      return new Promise(t => chrome.tabs.remove(a, t))
    }
    static async open ({ data: { url: t } }) {
      chrome.tabs.create({ url: t })
    }
    static info ({ tab_id: t }) {
      return new Promise(a => {
        try {
          chrome.tabs.get(t, t => a(t))
        } catch (t) {
          a(false)
        }
      })
    }
  }
  class e {
    static DEFAULT = {
      version: 2,
      hcaptcha_auto_solve: true,
      hcaptcha_solve_delay: 1e3,
      hcaptcha_auto_open: true,
      hcaptcha_open_delay: 1e3,
      recaptcha_auto_solve: true,
      recaptcha_solve_delay: 1e3,
      recaptcha_auto_open: true,
      recaptcha_open_delay: 1e3,
      recaptcha_solve_method: 'image',
      debug: false
    }
    static data = {}
    static _save () {
      return new Promise(t => chrome.storage.sync.set({ settings: e.data }, t))
    }
    static load () {
      return new Promise(a => {
        chrome.storage.sync.get(['settings'], async ({ settings: t }) => {
          t
            ? ((e.data = t),
              e.data.version !== e.DEFAULT.version && (await e.reset()))
            : await e.reset(),
            a()
        })
      })
    }
    static async get () {
      return e.data
    }
    static async set ({ data: { id: t, value: a } }) {
      ;(e.data[t] = a), await e._save()
    }
    static async reset () {
      ;(e.data = t(e.DEFAULT)), await e._save()
    }
  }
  class r {
    static inject ({ tab_id: t, data: { func: a, args: e } }) {
      const c = {
        target: { tabId: t, allFrames: true },
        world: 'MAIN',
        injectImmediately: true,
        func: a,
        args: e
      }
      return new Promise(t => chrome.scripting.executeScript(c, t))
    }
  }
  class a {
    static async reset ({ tab_id: t }) {
      return (
        await r.inject({
          tab_id: t,
          data: {
            func: function () {
              try {
                window.grecaptcha?.reset()
              } catch {}
            },
            args: []
          }
        }),
        true
      )
    }
    static fetch ({ tab_id: t }) {
      return new Promise(async a => {
        const e = 'recaptcha_response',
          c =
            (await r.inject({
              tab_id: t,
              data: {
                func: function (t) {
                  window.grecaptcha &&
                    window.postMessage({
                      method: 'set_cache',
                      data: { name: t, value: window.grecaptcha.getResponse() }
                    })
                },
                args: [e]
              }
            }),
            setInterval(async () => {
              var t = await s.get({ data: { name: e } })
              if (t)
                return (
                  clearInterval(c), await s.remove({ data: { name: e } }), a(t)
                )
            }, 1e3))
      })
    }
  }
  class i {
    static STATUS_URL =
      'https://api.nopecha.com/status?v=' + chrome.runtime.getManifest().version
    static STATUS_CHECK_INTERVAL = 1e4
    static status = 'Online'
    static checking_status = false
    static async run_status_check () {
      return (
        setInterval(() => {
          i.check_status()
        }, i.STATUS_CHECK_INTERVAL),
        true
      )
    }
    static async check_status () {
      if (i.checking_status) return false
      i.checking_status = true
      let t = 'Offline'
      try {
        const a = await fetch(i.STATUS_URL)
        t = await a.text()
      } catch {}
      return (
        await i.set_status({ data: { status: t } }), (i.checking_status = false), t
      )
    }
    static async set_status ({ data: { status: c } }) {
      if (i.status !== c) {
        let t,
          a = [0, 0, 0, 0],
          e = ''
        if ('Online' === (i.status = c))
          t = {
            16: 'icon/16.png',
            32: 'icon/32.png',
            48: 'icon/48.png',
            128: 'icon/128.png'
          }
        else if ('Offline' === c)
          (t = {
            16: 'icon/16.png',
            32: 'icon/32.png',
            48: 'icon/48.png',
            128: 'icon/128.png'
          }),
            (e = 'Off'),
            (a = '#a44')
        else if ('Slow' === c)
          (t = {
            16: 'icon/16.png',
            32: 'icon/32.png',
            48: 'icon/48.png',
            128: 'icon/128.png'
          }),
            (e = 'Slow'),
            (a = '#f8d66d')
        else {
          if ('Update Required' !== c) return false
          ;(t = {
            16: 'icon/16.png',
            32: 'icon/32.png',
            48: 'icon/48.png',
            128: 'icon/128.png'
          }),
            (e = 'Update'),
            (a = '#f8d66d')
        }
        return (
          chrome.action.setIcon({ path: t }),
          chrome.action.setBadgeText({ text: e }),
          chrome.action.setBadgeBackgroundColor({ color: a }),
          true
        )
      }
    }
    static async get_status () {
      return await i.check_status(), i.status
    }
    static async check_plan ({ data: { key: t } }) {
      if (i.checking_plan) return false
      i.checking_plan = true
      let a = { plan: 'free', credit: 0 }
      try {
        'undefined' === t && (t = '')
        const e = await fetch(i.STATUS_URL + '&k=' + t)
        a = JSON.parse(await e.text())
      } catch {}
      return (i.checking_plan = false), a
    }
    static async get_plan ({ data: { key: t } }) {
      return await i.check_plan({ data: { key: t } })
    }
  }
  const o = {
    set_cache: s.set,
    get_cache: s.get,
    remove_cache: s.remove,
    append_cache: s.append,
    empty_cache: s.empty,
    inc_cache: s.inc,
    dec_cache: s.dec,
    zero_cache: s.zero,
    fetch: class {
      static async fetch ({ data: { url: t, options: a } }) {
        try {
          const e = await fetch(t, a)
          return await e.text()
        } catch {
          return null
        }
      }
    }.fetch,
    reload_tab: n.reload,
    close_tab: n.close,
    open_tab: n.open,
    info_tab: n.info,
    get_settings: e.get,
    set_settings: e.set,
    reset_settings: e.reset,
    reset_recaptcha: a.reset,
    fetch_recaptcha: a.fetch,
    translate: class d {
      static base_url = 'https://translate.googleapis.com/translate_a/single'
      static async translate ({ data: { from: t, to: a, text: e } }) {
        let c = await fetch(
          d.base_url + `?client=gtx&sl=${t}&tl=${a}&dt=t&q=` + encodeURI(e)
        ).then(t => t.json())
        return (c = c && c[0] && c[0][0] && c[0].map(t => t[0]).join(''))
      }
    }.translate,
    get_server_plan: i.get_plan
  }
  ;(async () => {
    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [
        {
          id: 1,
          priority: 1,
          action: {
            type: 'redirect',
            redirect: {
              transform: {
                queryTransform: {
                  addOrReplaceParams: [{ key: 'hl', value: 'en-US' }]
                }
              }
            }
          },
          condition: {
            regexFilter:
              '^https://[^\\.]*\\.(google|recaptcha)\\.(com|net)/recaptcha',
            resourceTypes: ['sub_frame', 'script']
          }
        }
      ],
      removeRuleIds: [1]
    }),
      await e.load(),
      chrome.runtime.onMessage.addListener((t, a, e) => {
        const c = !['get_settings', 'set_settings', 'set_cache'].includes(
          t.method
        )
        return (
          c,
          o[t.method]({ tab_id: a?.tab?.id, data: t.data }).then(t => {
            c
            try {
              e(t)
            } catch (t) {}
          }),
          true
        )
      })
  })()
})()
