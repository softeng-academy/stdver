/*
**  StdVer ~ Standard Versioning
**  Copyright (c) 2023 SEA Software Engineering Academy gGmbH
**  Copyright (c) 2008-2023 Dr. Ralf S. Engelschall
**  Licensed under MIT license <https://spdx.org/licenses/MIT.html>
*/

import moment from "moment"

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
    M: number,
    N: number,
    p: StdVerPhase,
    R: number,
    D: number,
    H: string
    S: StdVerScope
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
        let S: StdVerScope
        switch (m[7]) {
            case "XA": S = StdVerScope.XA; break
            case "LA": S = StdVerScope.LA; break
            case "EA": S = StdVerScope.EA; break
            default:   S = StdVerScope.GA; break
        }
        return {
            M: parseInt(m[1]),
            N: parseInt(m[2]),
            p,
            R: parseInt(m[4]),
            D: m[5] ? parseInt(m[5]) : undefined,
            H: m[6] ?? "",
            S
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
    explain (encoding: string) {
        const decoding = this.decode(encoding)
        let text = `Version ${decoding.M}.${decoding.N}'s`
        if (decoding.R === 0)
            text += " initial"
        else {
            const R = decoding.R + 1
            text += ` ${R}`
            if      (R === 1)  text += "st"
            else if (R === 2)  text += "nd"
            else if (R === 3)  text += "rd"
            else               text += "th"
        }
        text += " "
        if      (decoding.p === StdVerPhase.alpha)     text += "alpha release"
        else if (decoding.p === StdVerPhase.beta)      text += "beta release"
        else if (decoding.p === StdVerPhase.candidate) text += "release candidate"
        else                                           text += "release"
        if (decoding.D) text += `, made on ${decoding.D.toString().replace(/^(....)(..)(..)$/, "$1.$2.$3")}`
        if (decoding.H) text += `, from source state 0x${decoding.H}`
        if (decoding.S) {
            if      (decoding.S === StdVerScope.XA) text += ", intended for no availability"
            else if (decoding.S === StdVerScope.LA) text += ", intended for limited availability"
            else if (decoding.S === StdVerScope.EA) text += ", intended for early availability"
            else if (decoding.S === StdVerScope.GA) text += ", intended for general availability"
        }
        text += "."
        return text
    }
}

