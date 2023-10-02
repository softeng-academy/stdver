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
import { globby }  from "globby"

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
        this.program.command("modify")
            .option("-l, --level <level>", "Standard Versioning scheme level", (v: string, p: number) => {
                const l = parseInt(v, 10)
                if (isNaN(l))
                    this.fatal(new Error("invalid option argument: invalid string (expected number)"))
                if (l < 0 || l > 2)
                    this.fatal(new Error("invalid option argument: out of range (expected 0..2)"))
                return l
            }, 0)
            .option("-b, --bump <part>", "Standard Versioning identifier part to bump", "R")
            .option("-s, --set <key-val>", "Standard Versioning identifier part to set (after bumpings were done)", (v, l) => l.concat([ v ]), [] as string[])
            .argument("<version>", "Standard Versioning identifier to change")
            .action((version, opts) => { try { this.modify(opts, version) } catch (ex) { this.fatal(ex) } })
        this.program.command("explain")
            .option("-f, --format <format>", "format ('text', 'table', 'json', 'yaml')", "table")
            .option("-m, --markup <markup>", "markup ('none', 'ansi', 'html')", process.stdout.isTTY ? "ansi" : "none")
            .argument("<version>", "Standard Versioning identifier to explain")
            .action((version, opts) => { try { this.explain(opts, version) } catch (ex) { this.fatal(ex) } })
        this.program.command("hash")
            .option("-t, --type <type>", "source state type ('path', 'string')", "string")
            .argument("<source...>", "file or directory to hash")
            .action(async (path, opts) => { try { await this.hash(opts, path) } catch (ex) { this.fatal(ex) } })
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
            "$ stdver modify -b N 1.2.3\n" +
            "$ stdver explain 1.2a3.20230801+ABCD-XA\n" +
            "$ stdver hash src/**/*.js '!src/**/*.bak'\n\n")
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
    modify (opts: any, version: string) {
        const api = new StdVerAPI()
        const set = {} as { [ key: string ]: string }
        for (const kv of opts.set) {
            const [ k, v ] = kv.split("=")
            set[k] = v
        }
        console.log(set)
        const versionNew = api.modify(version, { level: opts.level, bump: opts.bump, set: set })
        process.stdout.write(versionNew + "\n")
    }
    explain (opts: any, version: string) {
        const api = new StdVerAPI()
        let text = api.explain(version, { format: opts.format, markup: opts.markup })
        text += text.match(/\n$/) ? "" : "\n"
        process.stdout.write(text)
    }
    async hash (opts: any, sources: string[]) {
        let content

        /*  dispatch according to type  */
        if (opts.type === "string") {
            /*  just concatenate all source strings into a buffer  */
            const encoder = new TextEncoder()
            content = encoder.encode(sources.join(""))
        }
        else if (opts.type === "path") {
            /*  find all files  */
            let files = await globby(sources, {
                onlyFiles: true,
                followSymbolicLinks: false,
                suppressErrors: true
            })

            /*  read and concatenate (in sorted order) all the contents into a buffer  */
            files = files.sort()
            let promises = [] as Promise<Buffer>[]
            for (const file of files)
                promises.push(fs.promises.readFile(file, { encoding: null }))
            let contents = await Promise.all(promises)
            content = Buffer.concat(contents)
            contents = []
            promises = []
        }
        else
            throw new Error("invalid type")

        /*  calculate and output hash through API  */
        const api = new StdVerAPI()
        const hash = await api.hash(content)
        process.stdout.write(hash + "\n")
    }
}
(new StdVerCLI()).main()

