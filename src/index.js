import meow from 'meow';
import chalk from 'chalk';
import { eachOfSeries } from 'async';
import { resolve } from 'path';
import { get as getRoot } from 'app-root-dir';

import generateTargets from './helpers/targets';
import { generateOutputMatrix, ammendOutputMatrix } from './helpers/outputMatrix';
import { findBest } from './helpers/utils';
import { getTranspilers } from './helpers/transpilers';

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
    try {
        eachOfSeries(targets, (env, targetId, targetCb) => {
            const input = findBest(env);
            if (input) {
                eachOfSeries(formats, (format, formatId, formatCb) => {
                    const transpilers = getTraspilers(command.flags.transpiler, {
                        minified: command.flags.minified,
                        presets: [],
                        plugins: [],
                        targetUnstable
                    });
                    eachOfSeries(transpilers, (transpilers, transpilerId, transpilerCb) => {
                        const outputFile = outputMatrix[`${targetId}-${transpilerCb}-${format}`];
                        if (outputFile) {
                            return createBundle({
                                input,
                                targetId,
                                transpilerId,
                                current,
                                format,
                                outputFile,
                                transpilerCb
                            });
                        } else {
                            return transpilerCb(null);
                        }
                    }, formatCb)
                }, targetCb)
            } else {
                targetCb(null);
            }
        })
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

export function createBundle({
    input,
    targetId,
    transpilerId,
    current,
    format,
    outputFile,
    transpilerCb
}) {

}
