import meow from 'meow';
import chalk from 'chalk';
import { resolve } from 'path';
import { get as getRoot } from 'app-root-dir';

import generateTargets from './helpers/targets';
import { generateOutputMatrix, ammendOutputMatrix } from './helpers/outputMatrix';
import { findBest } from './helpers/utils';

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

const { verbose, quiet, targetUnstable, outputFolder, inputWeb, inputNode, inputBinary } = command.flags;
if (verbose) {
    console.log(`Flags: ${command.flags}`);
}

const binaryConfig = pkg.bin;
let binaryOutput = null;
if (binaryConfig) {
    for (const name in binaryConfig) {
        binaryOutput = binaryConfig[name];
        break;
    }
}

let outputMatrix = generateOutputMatrix(pkg, binaryOutput);
if (outputFolder) {
    outputMatrix = ammendOutputMatrix(outputMatrix, pkg);
}

const rollupFormat = {
    commonjs: 'cjs',
    esmodule: 'es'
};

const formats = ['esmodule', 'commonjs'];
const name = pkg.name;
const targets = generateTargets(inputNode, inputWeb, inputBinary);

function generateBuilds() {
    const inputs = Object.keys(targets)
        .map(target => {
            const input = findBest(targets[target]);
            if (!quiet) {
                console.log(`Using input ${chalk.blue(input)} for target ${chalk.blue(target)}`);
            }
            return input;
        })
        .filter(item => typeof item !== 'undefined')
}

generateBuilds();
