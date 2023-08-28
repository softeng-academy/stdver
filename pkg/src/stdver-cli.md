
# stdver(1) -- Standard Versioning CLI

## SYNOPSIS

`stdver`
\[`-h`|`--help`\]
*command* [*options*] [*arguments*]

`stdver`
`help`

`stdver`
`version`

`stdver`
`bump`
\[`-l`|`--level` *level*\]
\[`-p`|`--part` *part*\]
*version*

`stdver`
`explain`
\[`-f`|`--format` *format*\]
\[`-m`|`--markup` *markup*\]
*version*

`stdver`
`hash`
\[`-t`|`--type` *type*\]
*path* [...]

## DESCRIPTION

`stdver`(1) is a small Command-Line Interface (CLI) to the `stdver`(3)
JavaScript/TypeScript Application Programming Interface (API) of
[*Standard Versioning*](https://stdver.org). It allows the bumping
of version identifier parts, the explaining of version identifiers
and the generation of source state hash values.

## COMMANDS

The following commands are provided:

- `stdver`
  `help`:
  Show usage information.

- `stdver`
  `version`:
  Show version information.

- `stdver`
  `bump`
  \[`-l`|`--level` *level*\]
  \[`-p`|`--part` *part*\]
  *version*:
  Bump a *version* identifier *part* (default: `R`) under
  the constraint of a certain *Standard Versioning* level (default: `0`)

- `stdver`
  `explain`
  \[`-f`|`--format` *format*\]
  \[`-m`|`--markup` *markup*\]
  *version*:
  Explain a *version* identifier with an output *format* (default: `table`)
  and *markup* (default: `ansi` if `stdout` is a TTY, else `none`).

- `stdver`
  `hash`
  \[`-t`|`--type` *type*\]
  *source* [...]:
  Calculate the 16-bit hash value of one or more sources, which
  can be either strings (for *type*=`string`, the default) or
  filesystem paths (for *type*=`path`).

## EXAMPLES

```
$ stdver help
$ stdver version
$ stdver bump -p N 1.2.3
$ stdver explain 1.2a3.20230801+ABCD-XA
$ stdver hash src/**/*.js '!src/**/*.bak'
```

## HISTORY

*Standard Versioning* dates back to early definitions in the year
2008 by *Dr. Ralf S. Engelschall* in the context of its Software
Architecture trainings. It was formally defined and publically published
on [stdver.org](https://stdver.org) in 2023 to have a convenient
reference at hand on the Web. It was supplemented with the companion
`stdver`(1) CLI and `stdver`(3) JavaScript/TypeScript API.

## AUTHOR

Dr. Ralf S. Engelschall <rse@engelschall.com>

