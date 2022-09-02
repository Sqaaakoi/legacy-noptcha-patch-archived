# Noptcha, without affiliate link injection

Noptcha is a reCaptcha and hCaptcha solving extension created by GPU Drops.

This fork was made because I hate tracking stuff and I use an ad blocker (like you should on the modern internet) and also hate captchas, but I don't really want people over at GPU Drops to profit off me using their AI captcha solver.

Unfortunately, I discovered that the extension redirects some websites to have affilate tracking codes. I have prettified the code, made some of it readable and removed such functionality.

# What's changed, and how to make your update it

Most of the changes are in [background.js](background.js) and all tracking functionality _can_ be disabled by removing the `start()` call near the end of the file.

None of the original code in here belongs to me.

**No warranty or guarantee is provided that this extension will function or be updated.**

[Original extension](https://chrome.google.com/webstore/detail/noptcha-recaptcha-hcaptch/dknlfmjaanfblgfdfebhijalfmhmjjjo)