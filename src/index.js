import meow from 'meow';
import chalk from 'chalk';
import { get as getRoot } from 'app-root-dir';

const Root = getRoot();
const pkg = require(resolve(Root, 'package.json'));

const command = meow(`
    Usage
        $ frost-packager

    Options
        --input-node
        --input-web
        --input-binary

        --output-folder

        -t, --transpiler
        -x, --minified,
        -m, --sourcemap
        --target-unstable

        -v, --verbose
        -q, --quiet
`, {
    flags: {
        inputNode: {
            default: null
        },
        inputWeb: {
            default: null
        },
        inputBinary: {
            default: null
        },
        outputFolder: {
            default: null
        },

        transpiler: {
            default: 'babel',
            alias: 't'
        },

        minified: {
            default: false,
            alias: 'x'
        },

        sourcemap: {
            default: true,
            alias: 'm'
        },

        targetUnstable: {
            default: false
        },

        verbose: {
            default: false,
            alias: 'v'
        },

        quiet: {
            default: false,
            alias: 'q'
        }
    }
});

const { verbose, quiet, targetUnstable } = command.flags;
if (verbose) {
    console.log(`Flags: ${command.flags}`);
}

