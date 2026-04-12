/*
**  StdVer ~ Standard Versioning
**  Copyright (c) 2023-2026 SEA Software Engineering Academy gGmbH
**  Copyright (c) 2008-2026 Dr. Ralf S. Engelschall
**  Licensed under MIT license <https://spdx.org/licenses/MIT.html>
*/

import * as Vite from "vite"

export default Vite.defineConfig(({ command, mode, ssrBuild }) => ({
    base: "",
    root: "src",
    build: {
        lib: {
            entry:              "stdver-api.ts",
            formats:            [ "umd" ],
            fileName:           (fmt) => `stdver-api.browser.js`,
            name:               "StdVer"
        },
        sourcemap:              (mode === "development"),
        outDir:                 "../dst",
        emptyOutDir:            false
    }
}))

