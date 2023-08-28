/*
**  StdVer ~ Standard Versioning
**  Copyright (c) 2023 SEA Software Engineering Academy gGmbH
**  Copyright (c) 2008-2023 Dr. Ralf S. Engelschall
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
            name:               "stdver"
        },
        sourcemap:              (mode === "development"),
        outDir:                 "../dst",
        emptyOutDir:            false
    }
}))

