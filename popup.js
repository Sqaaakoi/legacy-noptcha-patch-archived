Date.now ||
  (Date.now = function () {
    return new Date().getTime()
  })
class BG {
  static exec (t, n) {
    return new Promise(e => {
      try {
        chrome.runtime.sendMessage({ method: t, data: n }, e)
      } catch {
        e()
      }
    })
  }
}
class Util {
  static sleep (t) {
    return new Promise(e => setTimeout(e, t))
  }
  static pad_left (e, t, n) {
    for (; ('' + e).length < n; ) e = '' + t + e
    return e
  }
  static time_to_hms (e) {
    e = Math.max(0, e)
    var t = Math.floor(e / 3600),
      n = ((e %= 3600), Math.floor(e / 60)),
      e = Math.floor(e % 60)
    return (
      `${Util.pad_left(t, '0', 2)}:${Util.pad_left(n, '0', 2)}:` +
      Util.pad_left(e, '0', 2)
    )
  }
  static capitalize (e) {
    return e.charAt(0).toUpperCase() + e.slice(1)
  }
}
let plan = null,
  checking_server_plan = false,
  rendering_server_plan = false
async function check_plan () {
  var e = await BG.exec('get_settings')
  e &&
    !checking_server_plan &&
    ((checking_server_plan = true),
    (plan = await BG.exec('get_server_plan', { key: e.key })).error &&
      (plan = {
        plan: plan.message,
        credit: 0,
        quota: 0,
        duration: null,
        lastreset: null
      }),
    (checking_server_plan = false))
}
async function initialize_ui () {
  var e = await BG.exec('get_settings')
  async function t (e, t) {
    const n = document.querySelector(`input#${e}[type="checkbox"]`)
    if (n) {
      var a = n.dataset?.disables?.split(',')
      if (a)
        for (const r of a) {
          const i = document.querySelector('#' + r)
          i.disabled = !t
        }
      ;(n.checked = t), await BG.exec('set_settings', { id: e, value: t })
    }
  }
  async function n (e, t) {
    const n = document.querySelector(`input#${e}[type="text"]`)
    if (n) {
      try {
        t = t.trim()
      } catch {}
      if (n.classList.contains('number')) {
        try {
          t = parseInt(t)
        } catch {
          t = 0
        }
        999999 < (t = (t = isNaN(t) ? 0 : t) < 0 ? 0 : t) && (t = 999999)
      }
      ;(n.value = t), await BG.exec('set_settings', { id: e, value: t })
    }
  }
  async function a (e, t) {
    const n = document.querySelector('select#' + e)
    n && ((n.value = t), await BG.exec('set_settings', { id: e, value: t }))
  }
  for (const i in e)
    try {
      await t(i, e[i]), await n(i, e[i]), await a(i, e[i])
    } catch {}
  for (const s of document.querySelectorAll(
    '.settings_group input[type="checkbox"]'
  ))
    s.addEventListener('change', () => t(s.id, s.checked))
  for (const c of document.querySelectorAll(
    '.settings_group input[type="text"]'
  ))
    c.addEventListener('input', () => n(c.id, c.value))
  for (const l of document.querySelectorAll('.settings_group select'))
    l.addEventListener('change', () => a(l.id, l.value))
  document.querySelector('#manage').addEventListener('click', async () => {
    await BG.exec('open_tab', { url: 'https://nopecha.com/manage' })
  }),
    document.querySelector('#footer').addEventListener('click', async () => {
      await BG.exec('open_tab', { url: 'https://discord.gg/gpudrops' })
    })
  let r = null
  document.querySelector('#key').addEventListener('input', () => {
    clearTimeout(r), (r = setTimeout(check_plan, 500))
  })
  for (const o of document.querySelectorAll('.tab_btn')) {
    o.dataset.target
    o.addEventListener('click', () => {
      for (const e of document.querySelectorAll('.tab'))
        e.classList.add('hidden')
      for (const t of document.querySelectorAll('.tab_btn'))
        t.classList.remove('active')
      o.classList.add('active'),
        document.querySelector(o.dataset.target).classList.remove('hidden')
    })
  }
}
async function render_plan () {
  var t = await BG.exec('get_settings')
  if (t && plan && !rendering_server_plan) {
    rendering_server_plan = true
    const a = document.querySelector('#plan'),
      r = document.querySelector('#credit'),
      i = document.querySelector('#refills'),
      s = document.querySelector('#incorrect_key')
    var n = Date.now() / 1e3
    let e = null
    plan.lastreset &&
      plan.duration &&
      (e = Math.floor(Math.max(0, plan.duration - (n - plan.lastreset)))),
      (a.innerHTML = plan.plan),
      'free' === plan.plan
        ? ('' !== t.key
            ? s.classList.remove('hidden')
            : s.classList.add('hidden'),
          a.classList.remove('green'),
          a.classList.add('red'))
        : (s.classList.add('hidden'),
          a.classList.remove('red'),
          a.classList.add('green')),
      0 === e
        ? (r.classList.remove('green'),
          r.classList.remove('red'),
          (r.innerHTML =
            '<div class="loading"><div></div><div></div><div></div><div></div></div>'))
        : ((r.innerHTML = plan.credit + ' / ' + plan.quota),
          0 === plan.credit
            ? (r.classList.remove('green'), r.classList.add('red'))
            : (r.classList.remove('red'), r.classList.add('green'))),
      e
        ? ((n = Util.time_to_hms(e)), (i.innerHTML = '' + n))
        : (i.innerHTML =
            '<div class="loading"><div></div><div></div><div></div><div></div></div>'),
      0 !== plan.duration && 0 === e && (await check_plan()),
      (rendering_server_plan = false)
  }
}
async function main () {
  await initialize_ui(),
    await check_plan(),
    await render_plan(),
    setInterval(render_plan, 250)
}
document.addEventListener('DOMContentLoaded', main)
