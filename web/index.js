/*
**  StdVer ~ Standard Versioning
**  Copyright (c) 2023 SEA Software Engineering Academy gGmbH
**  Copyright (c) 2008-2023 Dr. Ralf S. Engelschall
**  Licensed under Creative Commons Attribution 4.0 <https://spdx.org/licenses/CC-BY-4.0.html>
*/

Vue.createApp({
    data () {
        return {
            page: "scheme"
        }
    },
    mounted () {
        let page = window.location.hash ?? ""
        page = page.replace(/^#/, "")
        if (page === "")
            page = "scheme"
        this.page = page
    },
    methods: {
        goto (page) {
            this.page = page
            window.location.hash = page === "scheme" ? "" : `#${page}`
        }
    }
}).mount("body")

