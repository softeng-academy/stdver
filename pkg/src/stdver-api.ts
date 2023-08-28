/*
**  StdVer ~ Standard Versioning
**  Copyright (c) 2023 SEA Software Engineering Academy gGmbH
**  Copyright (c) 2008-2023 Dr. Ralf S. Engelschall
**  Licensed under MIT license <https://spdx.org/licenses/MIT.html>
*/

import moment from "moment"
import chalk  from "chalk"
import Table  from "cli-table3"

/*  Standard Versioning: Phase  */
export enum StdVerPhase {
    alpha      = 1,
    beta       = 2,
    candidate  = 3,
    release    = 4
}

/*  Standard Versioning: Scope  */
export enum StdVerScope {
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
    /*  decode a Standard Versioning identifier string into a record  */
    decode (encoding: string): StdVer {
        const m = encoding.match(/^(\d+)\.(\d+)(a|b|rc|\.)(\d+)(?:\.(\d{8}))?(?:\+([\dA-F]{4}))?(?:-([XLEG]A))?$/)
        if (m === null)
            throw new Error("invalid Standard Versioning identifier")
        let p: StdVerPhase
        switch (m[3]) {
            case "a": p = StdVerPhase.alpha;      break
            case "b": p = StdVerPhase.beta;       break
            case "c": p = StdVerPhase.candidate;  break
            default:  p = StdVerPhase.release;    break
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

    /*  bump a Standard Versioning identifier part  */
    bump (encoding: string, part: "M"|"N"|"p"|"R"|"D"|"H"|"S" = "R", level = 2) {
        /*  decode identifier  */
        const decoding = this.decode(encoding)

        /*  bump identifier part(s)  */
        if (part === "M") {
            decoding.M++
            decoding.N = 0
            if (level === 0)
                decoding.p = StdVerPhase.release
            else
                decoding.p = StdVerPhase.alpha
            decoding.R = 0
            if (decoding.D)
                decoding.D = parseInt(moment().format("YYYYMMDD"))
            if (decoding.H)
                decoding.H = ""
        }
        else if (part === "N") {
            decoding.N++
            if (level === 0)
                decoding.p = StdVerPhase.release
            else
                decoding.p = StdVerPhase.alpha
            decoding.R = 0
            if (decoding.D)
                decoding.D = parseInt(moment().format("YYYYMMDD"))
            if (decoding.H)
                decoding.H = ""
        }
        else if (part === "p") {
            switch (decoding.p) {
                case StdVerPhase.alpha:     decoding.p = StdVerPhase.beta;      break
                case StdVerPhase.beta:      decoding.p = StdVerPhase.candidate; break
                case StdVerPhase.candidate: decoding.p = StdVerPhase.release;   break
                case StdVerPhase.release:   decoding.p = StdVerPhase.alpha;     break
            }
            decoding.R = 0
            if (decoding.D)
                decoding.D = parseInt(moment().format("YYYYMMDD"))
            if (decoding.H)
                decoding.H = ""
        }
        else if (part === "R") {
            if (decoding.D)
                decoding.D = parseInt(moment().format("YYYYMMDD"))
            if (decoding.H)
                decoding.H = ""
        }
        else if (part === "D") {
            decoding.D = parseInt(moment().format("YYYYMMDD"))
            if (decoding.H)
                decoding.H = ""
        }
        else if (part === "H") {
            decoding.H = ""
        }
        else if (part === "S") {
            switch (decoding.S) {
                case StdVerScope.XA: decoding.S = StdVerScope.LA; break
                case StdVerScope.LA: decoding.S = StdVerScope.EA; break
                case StdVerScope.EA: decoding.S = StdVerScope.GA; break
                case StdVerScope.GA: decoding.S = StdVerScope.XA; break
            }
        }

        /*  (re-)encode identifer  */
        const encodingNew = this.encode(decoding)
        return encodingNew
    }

    /*  explain a Standard Versioning identifier  */
    explain (encoding: string, format: "text" | "table" | "json" | "yaml" = "text") {
        const decoding = this.decode(encoding)

        let text = ""
        if (format === "text") {
            text += `Version ${chalk.blue.bold(decoding.M + "." + decoding.N)}'s`
            if (decoding.R === 0)
                text += " initial"
            else {
                const R = decoding.R + 1
                text += ` ${chalk.blue.bold(R)}`
                if      (R === 1)  text += "st"
                else if (R === 2)  text += "nd"
                else if (R === 3)  text += "rd"
                else               text += "th"
            }
            text += " "
            if      (decoding.p === StdVerPhase.alpha)     text += chalk.blue.bold("alpha release")
            else if (decoding.p === StdVerPhase.beta)      text += chalk.blue.bold("beta release")
            else if (decoding.p === StdVerPhase.candidate) text += chalk.blue.bold("release candidate")
            else                                           text += chalk.blue.bold("release")
            if (decoding.D)
                text += `,\nsnapshotted on ${chalk.blue(decoding.D.toString().replace(/^(....)(..)(..)$/, "$1.$2.$3"))}`
            if (decoding.H)
                text += `,\nfrom source state 0x${chalk.blue(decoding.H)}`
            if (decoding.S) {
                if      (decoding.S === StdVerScope.XA) text += ",\nintended for " + chalk.blue("no availability")
                else if (decoding.S === StdVerScope.LA) text += ",\nintended for " + chalk.blue("limited availability")
                else if (decoding.S === StdVerScope.EA) text += ",\nintended for " + chalk.blue("early availability")
                else if (decoding.S === StdVerScope.GA) text += ",\nintended for " + chalk.blue("general availability")
            }
            text += ".\n"
        }
        else if (format === "table") {
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
            table.push([ "Major Version",      "M", chalk.blue.bold(decoding.M) ])
            table.push([ "Minor Version",      "N", chalk.blue.bold(decoding.N) ])
            table.push([ "Maturity Phase",     "p", chalk.blue.bold(StdVerPhase[decoding.p]) ])
            table.push([ "Phase Revision",     "R", chalk.blue.bold(decoding.R) ])
            if (decoding.D)
                table.push([ "Snapshot Date",      "D", chalk.blue(decoding.D) ])
            if (decoding.H)
                table.push([ "Source Hash",        "H", chalk.blue(decoding.H) ])
            if (decoding.S)
                table.push([ "Availability Scope", "S", chalk.blue(StdVerScope[decoding.S]) ])
            text = table.toString()
        }
        else if (format === "json") {
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
        else if (format === "yaml") {
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
            throw new Error("invalid format")
        return text
    }
}

