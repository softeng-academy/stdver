/*
**  StdVer ~ Standard Versioning
**  Copyright (c) 2023 SEA Software Engineering Academy gGmbH
**  Copyright (c) 2008-2023 Dr. Ralf S. Engelschall
**  Licensed under MIT license <https://spdx.org/licenses/MIT.html>
*/

import commander from "commander"
// import chalk     from "chalk"

// @ts-ignore
import my        from "../package.json"
// import stdver    from "./stdver-api"

/*  parse command-line arguments  */
const program = new commander.Command()
program.name("stdver")
    .description("Standard Versioning Command-Line Interface")
    .showHelpAfterError("hint: use option --help for usage information")
    .option("-h, --help", "show usage help", false)
    .option("-V, --version", "show program version information", false)
    .argument("[<stdver>]", "input file")
program.parse(process.argv)

/*  handle special help request  */
if (program.opts().help) {
    console.log(program.helpInformation())
    console.log("Example:\n  $ stdver bump 1.2.3 minor\n")
    process.exit(0)
}

/*  handle special version request  */
if (program.opts().version) {
    console.log(`${my.name} ${my.version} (Node.js ${process.versions.node})`)
    console.log(`${my.description}`)
    console.log(`Copyright (c) 2023 ${my.author.name} <${my.author.url}>`)
    console.log(`Licensed under ${my.license} <http://spdx.org/licenses/${my.license}.html>`)
    process.exit(0)
}

