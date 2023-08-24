/*
**  StdVer ~ Standard Versioning
**  Copyright (c) 2023 SEA Software Engineering Academy gGmbH
**  Copyright (c) 2008-2023 Dr. Ralf S. Engelschall
**  Licensed under Creative Commons Attribution 4.0 <https://spdx.org/licenses/CC-BY-4.0.html>
*/

Vue.createApp({
    data () {
        return {
            page: "scheme",
            decoder: {
                encoded: "",
                decoded: {},
                error: ""
            }
        }
    },
    mounted () {
        const onHashChange = () => {
            let page = window.location.hash ?? ""
            page = page.replace(/^#/, "")
            if (page === "")
                page = "scheme"
            if (page.match(/^(?:scheme|decoding|examples|alternatives|about)$/))
                this.page = page
            else {
                this.page = "decoder"
                this.decoder = this.decode(page)
            }
        }
        window.addEventListener("hashchange", () => {
            onHashChange()
        })
        onHashChange()
    },
    methods: {
        goto (page) {
            this.page = page
            window.location.hash = page === "scheme" ? "" : `#${page}`
        },
        decode (version) {
            const decoder = {
                encoded: version,
                decoded: {},
                error: ""
            }
            const m = version.match(/^(\d+)\.(\d+)(a|b|rc|\.)(\d+)(?:\.(\d{8}))?(?:\+([\dA-F]{4}))?(?:-([XLEG]A))?$/)
            if (m === null) {
                decoder.error = "invalid stdver representation"
                return decoder
            }
            else {
                decoder.decoded.M = m[1]
                decoder.decoded.N = m[2]
                decoder.decoded.p = m[3]
                decoder.decoded.R = m[4]
                decoder.decoded.D = m[5]
                decoder.decoded.H = m[6]
                decoder.decoded.S = m[7]
            }
            return decoder
        },
        explain (input) {
            if (!input)
                return ""
            const decoder = this.decode(input)
            const version = decoder.decoded
            let text = `Version ${version.M}.${version.N}'s`
            if (version.R === "0")
                text += " initial"
            else {
                let R = parseInt(version.R) + 1
                text += ` ${R}`
                if      (R === 1)  text += "st"
                else if (R === 2)  text += "nd"
                else if (R === 3)  text += "rd"
                else               text += "th"
            }
            text += " "
            if      (version.p === "a")  text += "alpha release"
            else if (version.p === "b")  text += "beta release"
            else if (version.p === "rc") text += "release candidate"
            else                         text += "release"
            if (version.D) text += `, made on ${version.D.replace(/^(....)(..)(..)$/, "$1.$2.$3")}`
            if (version.H) text += `, from source state 0x${version.H}`
            if (version.S) {
                if      (version.S === "XA") text += `, intended for no availability`
                else if (version.S === "LA") text += `, intended for limited availability`
                else if (version.S === "EA") text += `, intended for early availability`
                else if (version.S === "GA") text += `, intended for general availability`
            }
            text += "."
            return text
        }
    }
}).mount("body")

