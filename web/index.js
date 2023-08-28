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
            const api = new StdVer()
            try {
                decoder.decoded = api.decode(version)
            }
            catch (ex) {
                decoder.decoded = {}
                decoder.error = ex.toString()
                return decoder
            }
            return decoder
        },
        explain (input, format = "text", markup = "none") {
            if (!input)
                return ""
            const api = new StdVer()
            const out = api.explain(input, { format, markup })
            return out
        }
    }
}).mount("body")

