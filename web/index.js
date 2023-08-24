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
                this.decode(page)
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
            this.decoder.encoded = version
            this.decoder.decoded = {}
            this.decoder.error = ""
            const m = version.match(/^(\d+)\.(\d+)(a|b|rc|\.)(\d+)(?:\.(\d{8}))?(?:\+([\dA-F]{4}))?(?:-(XA|LA|EA|GA))?$/)
            if (m === null) {
                this.decoder.error = "invalid stdver representation"
                return
            }
            else {
                this.decoder.decoded.M = m[1]
                this.decoder.decoded.N = m[2]
                this.decoder.decoded.p = m[3]
                this.decoder.decoded.R = m[4]
                this.decoder.decoded.D = m[5]
                this.decoder.decoded.H = m[6]
                this.decoder.decoded.S = m[7]
            }
        }
    }
}).mount("body")

