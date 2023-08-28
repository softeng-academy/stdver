
# stdver(3) -- Standard Versioning API

## SYNOPSIS

```
declare enum StdVerPhase {
    alpha     = 1,
    beta      = 2,
    candidate = 3,
    release   = 4
}
declare enum StdVerScope {
    XA        = 1,
    LA        = 2,
    EA        = 3,
    GA        = 4
}
export interface StdVer {
    M:  number
    N:  number
    p:  StdVerPhase
    R:  number
    D?: number
    H?: string
    S?: StdVerScope
}
export default class StdVerAPI {
    Phase: typeof StdVerPhase
    Scope: typeof StdVerScope
    decode(
        encoding: string
    ): StdVer
    encode(
        decoding: StdVer
    ): string
    bump(
        encoding: string,
        options?: {
            part?:  string
            level?: number
        }
    ): string;
    explain(
        encoding: string,
        options?: {
            format?: string
            markup?: string
        }
    ): string;
    hash(
        buf: Buffer | ArrayBuffer
    ): Promise<string>
}
```

## DESCRIPTION

`stdver`(3) is a small Application Programming Interface (API)
of [*Standard Versioning*](https://stdver.org).

## HISTORY

*Standard Versioning* dates back to early definitions in the year
2008 by *Dr. Ralf S. Engelschall* in the context of its Software
Architecture trainings. It was formally defined and publically published
on [stdver.org](https://stdver.org) in 2023 to have a convenient
reference at hand on the Web. It was supplemented with the companion
`stdver`(1) CLI and `stdver`(3) JavaScript/TypeScript API.

## AUTHOR

Dr. Ralf S. Engelschall <rse@engelschall.com>

