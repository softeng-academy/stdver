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
            version: "",
            decoded: {},
            error: ""
        }
    },
    watch: {
        decoder (val) {
            console.log("WATCH", val)
        }
    },
    mounted () {
        const onHashChange = () => {
            let page = window.location.hash ?? ""
            page = page.replace(/^#/, "")
            if (page === "")
                page = "scheme"
            if (page.match(/^(?:scheme|decoding|decoder|examples|alternatives|about)$/))
                this.page = page
            else {
                this.page = "decoder"
                this.hashImport(page)
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
        hashImport (version) {
            this.version = version
            const api = new StdVer()
            try {
                this.decoded = api.decode(this.version)
                this.error   = ""
            }
            catch (ex) {
                this.decoded = {}
                this.error   = ex.toString()
            }
        },
        hashExport (el) {
            if (this.version === "")
                window.location.hash = `#decoder`
            else
                window.location.hash = `#${this.version}`
        },
        explain (input, format = "text", markup = "none") {
            if (!input)
                return ""
            const api = new StdVer()
            try {
                const out = api.explain(input, { format, markup })
                return out
            }
            catch (ex) {
                return `ERROR: ${ex.toString()}`
            }
        }
    }
}).mount("body")

