(async () => {
    var { } = await import(chrome.runtime.getURL("utils.js"));
    let a = null
        , t = false
        , r = false;
    function n(e, t, r = false) {
        e && (r || a !== e) && (true === t && "false" === e.getAttribute("aria-pressed") || false === t && "true" === e.getAttribute("aria-pressed")) && e.click()
    }
    document.addEventListener("mousedown", e => {
        "false" === e?.target?.parentNode?.getAttribute("aria-pressed") ? (t = true,
            r = true) : "true" === e?.target?.parentNode?.getAttribute("aria-pressed") && (t = true,
                r = false),
            a = e?.target?.parentNode
    }
    ),
        document.addEventListener("mouseup", e => {
            t = false,
                a = null
        }
        ),
        document.addEventListener("mousemove", e => {
            t && (a !== e?.target?.parentNode && null !== a && n(a, r, true),
                n(e?.target?.parentNode, r))
        }
        )
}
)();
