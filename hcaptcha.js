(async () => {
    const s = "http://144.126.221.48:31300"
        , d = [400, 450]
        , { Logger: e, Time: m, BG: f, Net: o, Image: h } = await import(chrome.runtime.getURL("utils.js"));
    async function w({ task: e, task_img: t, images: a }) {
        for (; "Online" !== await f.exec("get_server_status");)
            await m.sleep(1e3);
        var r = {
            y: "h",
            j: "c",
            i: a,
            g: 1,
            t: e,
            a: t,
            v: chrome.runtime.getManifest().version
        }
            , r = await o.fetch(s, {
                method: "POST",
                body: JSON.stringify(r)
            });
        try {
            var i = JSON.parse(r);
            if ("error" in i)
                return 13 === i.error ? (await m.sleep(1e3),
                    await w({
                        task: e,
                        task_img: t,
                        images: a
                    })) : (10 === i.error ? await u() : 14 === i.error && await f.exec("set_server_status", {
                        status: "Slow"
                    }),
                    {
                        job_id: null,
                        clicks: null
                    });
            else {
                var c = i.data;
                for (; ;) {
                    await m.sleep(500);
                    var n = await o.fetch(s + "?id=" + c);
                    try {
                        var l = JSON.parse(n);
                        if ("error" in l) {
                            if (12 != l.error)
                                return await {
                                    job_id: c,
                                    clicks: null
                                };
                            continue
                        }
                        return await {
                            job_id: c,
                            clicks: l.data
                        }
                    } catch (e) { }
                }
                return await void 0
            }
        } catch (e) {
            await u()
        }
        return {
            job_id: null,
            clicks: null
        }
    }
    async function u() {
        await f.exec("set_server_status", {
            status: "Offline"
        })
    }
    function g(e) {
        const t = e.style.background?.trim()?.match(/(?!^)".*?"/g);
        return t && 0 !== t.length ? t[0].replaceAll('"', "") : null
    }
    let p = null;
    async function _() {
        if (e.debug) {
            let e = await f.exec("get_cache", {
                name: "hcaptcha_pass"
            })
                , t = await f.exec("get_cache", {
                    name: "hcaptcha_fail"
                });
            null === e && (e = 0),
                null === t && (t = 0);
            0 < e + t && Math.round(100 * e / (e + t))
        }
    }
    async function t(e) {
        if ("block" === document.querySelector("div.check")?.style.display)
            return r || (await f.exec("inc_cache", {
                name: "hcaptcha_pass"
            }),
                await _(),
                r = true),
                void (e.debug && window.location.reload());
        r = false,
            await m.sleep(e.open_delay),
            document.querySelector("#checkbox")?.click()
    }
    async function a(e) {
        y = !(y || !function () {
            const e = document.querySelector(".display-error");
            return "true" !== e?.getAttribute("aria-hidden")
        }()) && (await f.exec("inc_cache", {
            name: "hcaptcha_fail"
        }),
            await _(),
            true);
        c = 100;
        const { task: t, task_url: a, cells: r, urls: i } = await new Promise(l => {
            let s = false;
            const o = setInterval(() => {
                if (!s) {
                    s = true;
                    var e = document.querySelector("h2.prompt-text")?.innerText?.replace(/\s+/g, " ")?.trim();
                    if (e) {
                        var t = document.querySelector(".challenge-example > .image > .image")
                            , t = g(t);
                        if (t && "" !== t) {
                            var a = document.querySelectorAll(".task-image");
                            if (9 !== a.length)
                                s = false;
                            else {
                                const i = []
                                    , c = [];
                                for (const n of a) {
                                    var r = n.querySelector("div.image");
                                    if (!r)
                                        return void (s = false);
                                    r = g(r);
                                    if (!r || "" === r)
                                        return void (s = false);
                                    i.push(n),
                                        c.push(r)
                                }
                                a = JSON.stringify(c);
                                if (p !== a)
                                    return p = a,
                                        clearInterval(o),
                                        s = false,
                                        l({
                                            task: e,
                                            task_url: t,
                                            cells: i,
                                            urls: c
                                        });
                                s = false
                            }
                        } else
                            s = false
                    } else
                        s = false
                }
            }
                , c)
        }
        );
        var c, n = await h.encode(a);
        const l = [];
        for (const u of i)
            l.push(await h.encode(u));
        var s = m.time()
            , o = (await w({
                task: t,
                task_img: n,
                images: l
            }))["clicks"];
        if (o) {
            n = e.solve_delay - (m.time() - s);
            0 < n && await m.sleep(n),
                await m.random_sleep(...d);
            for (let e = 0; e < o.length; e++)
                false !== o[e] && "true" !== r[e].getAttribute("aria-pressed") && r[e].click();
            await m.random_sleep(...d);
            try {
                document.querySelector(".button-submit").click()
            } catch (e) { }
        }
    }
    let r = false
        , y = false;
    for (; ;) {
        await m.sleep(1e3);
        var i = await f.exec("get_settings");
        i && (e.debug = i.debug,
            i.auto_open && null !== document.querySelector("div.check") ? await t(i) : i.auto_solve && null !== document.querySelector("h2.prompt-text") && await a(i))
    }
}
)();
