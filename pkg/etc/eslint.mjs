/*
**  StdVer ~ Standard Versioning
**  Copyright (c) 2023-2026 SEA Software Engineering Academy gGmbH
**  Copyright (c) 2008-2026 Dr. Ralf S. Engelschall
**  Licensed under MIT license <https://spdx.org/licenses/MIT.html>
*/

import pluginJs        from "@eslint/js"
import * as pluginStd  from "neostandard"
import pluginPromise   from "eslint-plugin-promise"
import pluginTS        from "typescript-eslint"
import globals         from "globals"
import parserTS        from "@typescript-eslint/parser"

export default [
    { ignores: [ "etc/eslint.mjs", "dst" ] },
    pluginJs.configs.recommended,
    ...pluginTS.configs.strict,
    ...pluginTS.configs.stylistic,
    ...pluginStd.neostandard({
        ts:      true,
        ignores: pluginStd.resolveIgnoresFromGitignore()
    }),
    {
        plugins: {
            "promise": pluginPromise
        },
        files: [ "**/*.ts" ],
        languageOptions: {
            ecmaVersion: 2024,
            sourceType:  "module",
            parser: parserTS,
            parserOptions: {
                ecmaFeatures: {
                    jsx: false
                }
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.commonjs,
                ...globals.worker,
                ...globals.serviceworker,
                "BufferEncoding": "readonly"
            }
        },
        rules: {
            "curly":                                              "off",
            "require-atomic-updates":                             "off",
            "dot-notation":                                       "off",
            "no-labels":                                          "off",
            "no-useless-constructor":                             "off",
            "no-dupe-class-members":                              "off",
            "valid-typeof":                                       "off",
            "no-unused-vars":                                     "off",

            "@stylistic/indent":                                  [ "error", 4, { SwitchCase: 1 } ],
            "@stylistic/linebreak-style":                         [ "error", "unix" ],
            "@stylistic/semi":                                    [ "error", "never" ],
            "@stylistic/operator-linebreak":                      [ "error", "after", { overrides: { "&&": "before", "||": "before", ":": "after" } } ],
            "@stylistic/quotes":                                  [ "error", "double" ],
            "@stylistic/brace-style":                             "off",

            "@stylistic/no-multi-spaces":                         "off",
            "@stylistic/no-multiple-empty-lines":                 "off",
            "@stylistic/key-spacing":                             "off",
            "@stylistic/object-property-newline":                 "off",
            "@stylistic/space-in-parens":                         "off",
            "@stylistic/array-bracket-spacing":                   "off",
            "@stylistic/lines-between-class-members":             "off",
            "@stylistic/multiline-ternary":                       "off",
            "@stylistic/quote-props":                             "off",

            "@typescript-eslint/no-empty-function":               "off",
            "@typescript-eslint/no-explicit-any":                 "off",
            "@typescript-eslint/no-unused-vars":                  "off",
            "@typescript-eslint/ban-ts-comment":                  "off",
            "@typescript-eslint/no-this-alias":                   "off",
            "@typescript-eslint/no-non-null-assertion":           "off",
            "@typescript-eslint/consistent-type-definitions":     "off",
            "@typescript-eslint/array-type":                      "off",
            "@typescript-eslint/no-extraneous-class":             "off",
            "@typescript-eslint/consistent-indexed-object-style": "off",
            "@typescript-eslint/adjacent-overload-signatures":    "off"
        }
    }
]

