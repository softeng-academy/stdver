/*
**  StdVer ~ Standard Versioning
**  Copyright (c) 2023 SEA Software Engineering Academy gGmbH
**  Copyright (c) 2008-2023 Dr. Ralf S. Engelschall
**  Licensed under MIT license <https://spdx.org/licenses/MIT.html>
*/

import crypto    from "tiny-webcrypto"
import moment    from "moment"
import chalk     from "chalk"
import stripAnsi from "strip-ansi"
import Table     from "cli-table3"

/*  Standard Versioning: Phase  */
enum StdVerPhase {
    alpha      = 1,
    beta       = 2,
    candidate  = 3,
    release    = 4
}

/*  Standard Versioning: Scope  */
enum StdVerScope {
    XA = 1,
    LA = 2,
    EA = 3,
    GA = 4
}

/*  Standard Versioning record  */
export interface StdVer {
    M:  number,
    N:  number,
    p:  StdVerPhase,
    R:  number,
    D?: number,
    H?: string
    S?: StdVerScope
}

/*  Standard Versioning API  */
export default class StdVerAPI {
    Phase = StdVerPhase
    Scope = StdVerScope

    /*  decode a Standard Versioning identifier string into a record  */
    decode (encoding: string): StdVer {
        const m = encoding.match(/^(\d+)\.(\d+)(a|b|rc|\.)(\d+)(?:\.(\d{8}))?(?:\+([\dA-F]{4}))?(?:-([XLEG]A))?$/)
        if (m === null)
            throw new Error("invalid Standard Versioning identifier")
        let p: StdVerPhase
        switch (m[3]) {
            case "a":  p = StdVerPhase.alpha;     break
            case "b":  p = StdVerPhase.beta;      break
            case "rc": p = StdVerPhase.candidate; break
            default:   p = StdVerPhase.release;   break
        }
        let S: StdVerScope | undefined
        if (m[7]) {
            switch (m[7]) {
                case "XA": S = StdVerScope.XA; break
                case "LA": S = StdVerScope.LA; break
                case "EA": S = StdVerScope.EA; break
                case "GA": S = StdVerScope.GA; break
            }
        }
        return {
            M: parseInt(m[1]),
            N: parseInt(m[2]),
            p,
            R: parseInt(m[4]),
            ...(m[5] ? { D: parseInt(m[5]) } : {}),
            ...(m[6] ? { H: m[6] } : {}),
            ...(S ? { S } : {})
        } as StdVer
    }

    /*  encode a Standard Versioning record into an identifier  */
    encode (decoding: StdVer) {
        let encoding = `${decoding.M}.${decoding.N}`
        switch (decoding.p) {
            case StdVerPhase.alpha:     encoding += "a";  break
            case StdVerPhase.beta:      encoding += "b";  break
            case StdVerPhase.candidate: encoding += "rc"; break
            case StdVerPhase.release:   encoding += ".";  break
        }
        encoding += `${decoding.R}`
        if (decoding.D)
            encoding += `.${decoding.D}`
        if (decoding.H)
            encoding += `+${decoding.H}`
        if (decoding.S) {
            switch (decoding.S) {
                case StdVerScope.XA: encoding += "-XA"; break
                case StdVerScope.LA: encoding += "-LA"; break
                case StdVerScope.EA: encoding += "-EA"; break
                case StdVerScope.GA: encoding += "-GA"; break
            }
        }
        return encoding
    }

    /*  modify a Standard Versioning identifier part  */
    modify (encoding: string, options = {} as { level?: number, bump?: string, set?: { [ part: string ]: string } }) {
        /*  provide option defaults  */
        options = { level: 1, bump: "R", set: {} as { [ part: string ]: string }, ...options }

        /*  decode identifier  */
        const decoding = this.decode(encoding)

        /*  bump identifier part and update related parts implicitly  */
        if (options.bump === "M") {
            decoding.M++
            decoding.N = 0
            if (options.level === 0)
                decoding.p = StdVerPhase.release
            else
                decoding.p = StdVerPhase.alpha
            decoding.R = 0
            if (decoding.D)
                delete decoding.D
            if (decoding.H)
                delete decoding.H
        }
        else if (options.bump === "N") {
            decoding.N++
            if (options.level === 0)
                decoding.p = StdVerPhase.release
            else
                decoding.p = StdVerPhase.alpha
            decoding.R = 0
            if (decoding.D)
                delete decoding.D
            if (decoding.H)
                delete decoding.H
        }
        else if (options.bump === "p") {
            switch (decoding.p) {
                case StdVerPhase.alpha:     decoding.p = StdVerPhase.beta;      break
                case StdVerPhase.beta:      decoding.p = StdVerPhase.candidate; break
                case StdVerPhase.candidate: decoding.p = StdVerPhase.release;   break
                case StdVerPhase.release:
                    throw new Error("cannot bump Phase higher than 'release'")
            }
            decoding.R = 0
            if (decoding.D)
                delete decoding.D
            if (decoding.H)
                delete decoding.H
        }
        else if (options.bump === "R") {
            decoding.R++
            if (decoding.D)
                delete decoding.D
            if (decoding.H)
                delete decoding.H
        }
        else if (options.bump === "D") {
            decoding.D = parseInt(moment().format("YYYYMMDD"))
            if (decoding.H)
                delete decoding.H
        }
        else if (options.bump === "H") {
            delete decoding.H
        }
        else if (options.bump === "S") {
            switch (decoding.S) {
                case StdVerScope.XA: decoding.S = StdVerScope.LA; break
                case StdVerScope.LA: decoding.S = StdVerScope.EA; break
                case StdVerScope.EA: decoding.S = StdVerScope.GA; break
                case StdVerScope.GA:
                    throw new Error("cannot bump Scope higher than 'GA'")
            }
        }

        /*  set identifier part explicitly  */
        if (options.set) {
            for (const key of Object.keys(options.set)) {
                const val = options.set[key]
                if (key === "M")
                    decoding.M = parseInt(val)
                else if (key === "N")
                    decoding.N = parseInt(val)
                else if (key === "p") {
                    if      (val === "a")  decoding.p = StdVerPhase.alpha
                    else if (val === "b")  decoding.p = StdVerPhase.beta
                    else if (val === "rc") decoding.p = StdVerPhase.candidate
                    else if (val === ".")  decoding.p = StdVerPhase.candidate
                    else
                        throw new Error("invalid phase field value")
                }
                else if (key === "R")
                    decoding.R = parseInt(val)
                else if (key === "D")
                    decoding.D = parseInt(val)
                else if (key === "H")
                    decoding.H = val
                else if (key === "S")
                    if      (val === "XA") decoding.S = StdVerScope.XA
                    else if (val === "LA") decoding.S = StdVerScope.LA
                    else if (val === "EA") decoding.S = StdVerScope.EA
                    else if (val === "GA") decoding.S = StdVerScope.GA
                    else
                        throw new Error("invalid scope field value")
                else
                    throw new Error("invalid field name for set operation")
            }
        }

        /*  (re-)encode identifier  */
        const encodingNew = this.encode(decoding)
        return encodingNew
    }

    /*  explain a Standard Versioning identifier  */
    explain (encoding: string, options = {} as { format?: string, markup?: string }) {
        /*  provide option defaults  */
        options = { format: "text", markup: "none", ...options }

        /*  decode identifier  */
        const decoding = this.decode(encoding)

        /*  dispatch according to format and markup  */
        let text = ""
        if (options.format === "text" && options.markup === "html") {
            text += `Version <span class="part part-M">${decoding.M + "." + decoding.N}</span>'s`
            text += " "
            if      (decoding.p === StdVerPhase.alpha)     text += "<span class=\"part part-p\">alpha release</span>"
            else if (decoding.p === StdVerPhase.beta)      text += "<span class=\"part part-p\">beta release</span>"
            else if (decoding.p === StdVerPhase.candidate) text += "<span class=\"part part-p\">release candidate</span>"
            else                                           text += "<span class=\"part part-p\">release</span>"
            text += ` in revision <span class="part part-R">${decoding.R}</span>`
            if (decoding.D)
                text += `, snapshotted on <span class="part part-D">${decoding.D.toString().replace(/^(....)(..)(..)$/, "$1.$2.$3")}</span>`
            if (decoding.H)
                text += `, from source state <span class="part part-H">0x${decoding.H}</span>`
            if (decoding.S) {
                text += ", released for "
                if      (decoding.S === StdVerScope.XA) text += "<span class=\"part part-S\">no availability</span>"
                else if (decoding.S === StdVerScope.LA) text += "<span class=\"part part-S\">limited availability</span>"
                else if (decoding.S === StdVerScope.EA) text += "<span class=\"part part-S\">early availability</span>"
                else if (decoding.S === StdVerScope.GA) text += "<span class=\"part part-S\">general availability</span>"
                text += " scope"
            }
            text += ".\n"
        }
        else if (options.format === "text" && options.markup?.match(/^(?:none|ansi)$/)) {
            text += `Version ${chalk.red(decoding.M + "." + decoding.N)}'s`
            text += " "
            if      (decoding.p === StdVerPhase.alpha)     text += chalk.red("alpha release")
            else if (decoding.p === StdVerPhase.beta)      text += chalk.red("beta release")
            else if (decoding.p === StdVerPhase.candidate) text += chalk.red("release candidate")
            else                                           text += chalk.red("release")
            text += ` in revision ${chalk.red(decoding.R)}`
            if (decoding.D)
                text += `, snapshotted on ${chalk.blue(decoding.D.toString().replace(/^(....)(..)(..)$/, "$1.$2.$3"))}`
            if (decoding.H)
                text += `, from source state ${chalk.blue("0x" + decoding.H)}`
            if (decoding.S) {
                text += ", intended for "
                if      (decoding.S === StdVerScope.XA) text += chalk.blue("no availability")
                else if (decoding.S === StdVerScope.LA) text += chalk.blue("limited availability")
                else if (decoding.S === StdVerScope.EA) text += chalk.blue("early availability")
                else if (decoding.S === StdVerScope.GA) text += chalk.blue("general availability")
                text += " scope"
            }
            text += ".\n"
            if (options.markup !== "ansi")
                text = stripAnsi(text)
        }
        else if (options.format === "table" && options.markup?.match(/^(?:none|ansi)$/)) {
            const table = new Table({
                head: [
                    chalk.reset.bold("Part"),
                    chalk.reset.bold("Id"),
                    chalk.reset.bold("Value")
                ],
                colWidths: [ 20, 4, 20 ],
                style: { "padding-left": 1, "padding-right": 1, border: [ "grey" ], compact: true },
                chars: { "left-mid": "", mid: "", "mid-mid": "", "right-mid": "" }
            })
            table.push([ "Major Version",      "M", chalk.red(decoding.M) ])
            table.push([ "Minor Version",      "N", chalk.red(decoding.N) ])
            table.push([ "Release Phase",      "p", chalk.red(StdVerPhase[decoding.p]) ])
            table.push([ "Release Revision",   "R", chalk.red(decoding.R) ])
            if (decoding.D)
                table.push([ "Snapshot Date",  "D", chalk.blue(decoding.D) ])
            if (decoding.H)
                table.push([ "Source Hash",    "H", chalk.blue(decoding.H) ])
            if (decoding.S)
                table.push([ "Release Scope",  "S", chalk.blue(StdVerScope[decoding.S]) ])
            text = table.toString()
            if (options.markup !== "ansi")
                text = stripAnsi(text)
        }
        else if (options.format === "table" && options.markup === "html") {
            text = "<table class=\"stdver\" style=\"text-align: left;\">\n"
            text += "    <tr><th class=\"part\">Part</th><th class=\"id\">Id</th><th class=\"value\">Value</th></tr>\n"
            text += `    <tr class="M"><td class="part">Major Version</td><td class="id">M</td><td class="value">${decoding.M}</td></tr>\n`
            text += `    <tr class="N"><td class="part">Minor Version</td><td class="id">N</td><td class="value">${decoding.N}</td></tr>\n`
            text += `    <tr class="p"><td class="part">Release Phase</td><td class="id">p</td><td class="value">${StdVerPhase[decoding.p]}</td></tr>\n`
            text += `    <tr class="R"><td class="part">Release Revision</td><td class="id">R</td><td class="value">${decoding.R}</td></tr>\n`
            if (decoding.D)
                text += `    <tr class="D"><td class="part">Snapshot Date</td><td class="id">D</td><td class="value">${decoding.D}</td></tr>\n`
            if (decoding.H)
                text += `    <tr class="H"><td class="part">Source Hash</td><td class="id">H</td><td class="value">${decoding.H}</td></tr>\n`
            if (decoding.S)
                text += `    <tr class="S"><td class="part">Release Scope</td><td class="id">S</td><td class="value">${StdVerScope[decoding.S]}</td></tr>\n`
            text += "</table>\n"
        }
        else if (options.format === "json") {
            text += "{"
            text += ` "M": ${decoding.M},`
            text += ` "N": ${decoding.N},`
            text += ` "p": "${StdVerPhase[decoding.p]}",`
            text += ` "R": ${decoding.R},`
            if (decoding.D)
                text += ` "D": ${decoding.D},`
            if (decoding.H)
                text += ` "H": "${decoding.H}",`
            if (decoding.S)
                text += ` "S": "${StdVerScope[decoding.S]}",`
            text = text.replace(/,$/, "")
            text += " }\n"
        }
        else if (options.format === "yaml") {
            text += `M: ${decoding.M}\n`
            text += `N: ${decoding.N}\n`
            text += `p: ${StdVerPhase[decoding.p]}\n`
            text += `R: ${decoding.R}\n`
            if (decoding.D)
                text += `D: ${decoding.D}\n`
            if (decoding.H)
                text += `H: ${decoding.H}\n`
            if (decoding.S)
                text += `S: ${StdVerScope[decoding.S]}\n`
        }
        else
            throw new Error("invalid format/markup combination")
        return text
    }

    /*  calculate hash values of a buffer  */
    async hash (buf: Buffer<ArrayBuffer> | ArrayBuffer) {
        /*  calculate 256-bit SHA digest  */
        const hashBuf = await crypto.subtle.digest("SHA-256", buf)

        /*  fold digest into 16-bit hash value  */
        const n = 2
        const hashArray = Array.from(new Uint8Array(hashBuf))
        const hashFolded = new Array(n)
        for (let i = 0; i < n; i++) {
            let folded = 0x00
            for (let j = 0; i + j < hashArray.length; j += n)
                folded ^= hashArray[i + j]
            hashFolded[i] = folded
        }

        /*  convert and return hash as a hexadecimal string  */
        return hashFolded.map((byte: number) =>
            byte.toString(16).padStart(2, "0").toUpperCase()).join("")
    }
}

