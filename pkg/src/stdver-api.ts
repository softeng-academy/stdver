/*
**  StdVer ~ Standard Versioning
**  Copyright (c) 2023 SEA Software Engineering Academy gGmbH
**  Copyright (c) 2008-2023 Dr. Ralf S. Engelschall
**  Licensed under MIT license <https://spdx.org/licenses/MIT.html>
*/

export default class StdVer {
    constructor () {}
    parse (str: string) {
        const m = str.match(/^(\d+)\.(\d+)(a|b|rc|\.)(\d+)(?:\.\d{8})?(?:\+[\dA-F]{4})?(?:-(XA|LA|EA|GA))?$/)
        if (m === null)
            throw new Error("invalid version identifier")
        return {
            majorVersion:  m[1],
            minorVersion:  m[2],
            maturityLevel: m[3],
            revision:      m[4],
            date:          m[5],
            hash:          m[6],
            scope:         m[7]
        }
    }
}

