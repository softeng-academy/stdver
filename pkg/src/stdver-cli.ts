#!/usr/bin/env node
/*!
**  StdVer ~ Standard Versioning
**  Copyright (c) 2023 SEA Software Engineering Academy gGmbH
**  Copyright (c) 2008-2023 Dr. Ralf S. Engelschall
**  Licensed under MIT license <https://spdx.org/licenses/MIT.html>
*/

import fs          from "node:fs"
import { Command } from "commander"
import chalk       from "chalk"

import StdVerAPI   from "./stdver-api.js"

class StdVerCLI {
    private program!: Command
    main () {
        /*  parse command-line arguments  */
        this.program = new Command()
        this.program.name("stdver")
            .description("Standard Versioning Command-Line Interface")
            .showHelpAfterError("hint: use option --help for usage information")
            .option("-h, --help", "show usage help", false)
            .action((opts) => { this.help(opts) })
        this.program.command("help")
            .action((opts) => { this.help(opts) })
        this.program.command("version")
            .action((opts) => { this.version(opts) })
        this.program.command("bump")
            .option("-l, --level <level>", "Standard Versioning scheme level", (v: string, p: number) => {
                const l = parseInt(v, 10)
                if (isNaN(l))
                    this.fatal(new Error("invalid option argument: invalid string (expected number)"))
                if (l < 0 || l > 2)
                    this.fatal(new Error("invalid option argument: out of range (expected 0..2)"))
                return l
            }, 0)
            .option("-p, --part <part>", "Standard Versioning identifier part to bump", "R")
            .argument("<version>", "Standard Versioning identifier to change")
            .action((version, opts) => { try { this.bump(opts, version) } catch (ex) { this.fatal(ex) } })
        this.program.command("explain")
            .option("-f, --format <format>", "format of explanation ('text', 'table', 'json', 'yaml')", "text")
            .argument("<version>", "Standard Versioning identifier to explain")
            .action((version, opts) => { try { this.explain(opts, version) } catch (ex) { this.fatal(ex) } })
        this.program.parse(process.argv)
    }
    fatal (error: any): never {
        let msg = error instanceof Error ? error.toString() : ("" + error)
        msg = msg.replace(/^Error:\s+/i, "")
        process.stderr.write(chalk.red(`stdver: ERROR: ${msg}\n`))
        process.exit(1)
    }
    help (opts: any) {
        process.stdout.write(this.program.helpInformation() + "\n")
        process.stdout.write("Examples:\n" +
            "$ stdver help\n" +
            "$ stdver version\n" +
            "$ stdver bump -p N 1.2.3\n" +
            "$ stdver explain 1.2a3.20230801+ABCD-XA\n\n")
        process.exit(0)
    }
    async version (opts: any) {
        const pkgFile = new URL("../package.json", import.meta.url)
        const pkgJSON = await fs.promises.readFile(pkgFile, { encoding: "utf8" })
        const pkg = JSON.parse(pkgJSON)
        process.stdout.write(chalk.blue.bold(`${pkg.name} ${pkg.version}`) + ` (node ${process.versions.node})\n`)
        process.stdout.write(chalk.blue(`${pkg.description}\n`))
        process.stdout.write(`Copyright (c) 2023 ${pkg.author.name} <${pkg.author.url}>\n`)
        process.stdout.write(`Licensed under ${pkg.license} <http://spdx.org/licenses/${pkg.license}.html>\n`)
        process.exit(0)
    }
    bump (opts: any, version: string) {
        const api = new StdVerAPI()
        const versionNew = api.bump(version, opts.part, opts.level)
        process.stdout.write(versionNew + "\n")
    }
    explain (opts: any, version: string) {
        const api = new StdVerAPI()
        const text = api.explain(version, opts.format)
        process.stdout.write(text + (text.match(/\n$/) ? "" : "\n"))
    }
}
(new StdVerCLI()).main()

