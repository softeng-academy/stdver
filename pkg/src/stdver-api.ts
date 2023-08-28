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
    explain (encoding: string, format: "text" | "table-cli" | "table-html" | "obj-json" | "obj-yaml" = "text") {
        const decoding = this.decode(encoding)

        let text = ""
        if (format === "text") {
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
                if      (decoding.S === StdVerScope.XA) text += ", intended for " + chalk.blue("No Availability")
                else if (decoding.S === StdVerScope.LA) text += ", intended for " + chalk.blue("Limited Availability")
                else if (decoding.S === StdVerScope.EA) text += ", intended for " + chalk.blue("Early Availability")
                else if (decoding.S === StdVerScope.GA) text += ", intended for " + chalk.blue("General Availability")
            }
            text += ".\n"
        }
        else if (format === "table-cli") {
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
            table.push([ "Maturity Phase",     "p", chalk.red(StdVerPhase[decoding.p]) ])
            table.push([ "Phase Revision",     "R", chalk.red(decoding.R) ])
            if (decoding.D)
                table.push([ "Snapshot Date",      "D", chalk.blue(decoding.D) ])
            if (decoding.H)
                table.push([ "Source Hash",        "H", chalk.blue(decoding.H) ])
            if (decoding.S)
                table.push([ "Availability Scope", "S", chalk.blue(StdVerScope[decoding.S]) ])
            text = table.toString()
        }
        else if (format === "table-html") {
            text = "<table style=\"text-align: left;\">\n"
            text += "    <tr><th>Part</th>              <th>Id</th><th>Value</th></tr>\n"
            text += `    <tr><td>Major Version</td>     <td>M</td> <td>${decoding.M}</td></tr>\n`
            text += `    <tr><td>Minor Version</td>     <td>N</td> <td>${decoding.N}</td></tr>\n`
            text += `    <tr><td>Maturity Phase</td>    <td>p</td> <td>${StdVerPhase[decoding.p]}</td></tr>\n`
            text += `    <tr><td>Phase Revision</td>    <td>R</td> <td>${decoding.R}</td></tr>\n`
            if (decoding.D)
                text += `    <tr><td>Snapshot Date</td>     <td>D</td> <td>${decoding.D}</td></tr>\n`
            if (decoding.H)
                text += `    <tr><td>Source Hash</td>       <td>H</td> <td>${decoding.H}</td></tr>\n`
            if (decoding.S)
                text += `    <tr><td>Availability Scope</td><td>S</td> <td>${StdVerScope[decoding.S]}</td></tr>\n`
            text += "</table>\n"
        }
        else if (format === "obj-json") {
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
        else if (format === "obj-yaml") {
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

