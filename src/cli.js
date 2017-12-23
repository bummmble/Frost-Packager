import meow from 'meow';
import chalk from 'chalk';
import nodeResolve from 'rollup-plugin-rebase';
import commonjs from 'rollup-plugin-commonjs';
import jsonPlugin from 'rollup-plugin-json';
import yamlPlugin from 'rollup-plugin-yaml';
import replacePlugin from 'rollup-plugin-replace';
import exec from 'rollup-plugin-exec';

import { resolve, relative, isAbsolute } from 'path';
import { eachOfSeries } from 'async';
import { rollup } from 'rollup';
import { get as getRoot } from 'app-root-dir';

import getBanner from './helpers/banner';
import generateTargets from './helpers/targets';
import { generateOutputMatrix, ammendOutputMatrix } from './helpers/outputMatrix';
import { findBest, camelize } from './helpers/utils';
import { getTranspilers } from './helpers/transpilers';

let cache;

export const Root = getRoot();
export const pkg = require(resolve(Root, 'package.json'));

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

const { verbose, quiet, targetUnstable, outputFolder, inputWeb, inputNode, inputBinary, minified, transpiler } = command.flags;
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
const name = pkg.name || camelize(pkg.name);
const banner = getBanner(pkg);
const targets = generateTargets(inputNode, inputWeb, inputBinary);

export function generateBuilds() {
    try {
        eachOfSeries(targets, (env, targetId, targetCb) => {
            const input = findBest(env);
            if (input) {
                eachOfSeries(formats, (format, formatId, formatCb) => {
                    const transpilers = getTraspilers(transpiler, {
                        minified,
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
    const prefix = 'process.env.';
    const vars = {
        [`${prefix}NAME`]: JSON.stringify(pkg.name),
        [`${prefix}VERSION`]: JSON.stringify(pkg.version),
        [`${prefix}TARGET`]: JSON.stringify(targetId)
    };

    return rollup({
        input,
        cache,
        onwarn: warn => console.warn(chalk.red(`- ${warn.message}`)),
        external(dependency) {
            if (dependency == input) {
                return false;
            }

            if (isAbsolute(dependency)) {
                const relativePath = relative(Root, dependency);
                return Boolean(/node_modules/.exec(relativePath));
            }

            return dependency.charAt(0) !== '.';
        },
        plugins: [
            nodeResolve({
                extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
                jsnext: true,
                module: true,
                main: true
            }),
            replacePlugin(vars),
            commonjs({
                include: 'node_modules/**'
            }),
            yamlPlugin(),
            jsonPlugin(),
            current,
            transpilerId === 'binary' ? exec() : null
        ]
    })
    .then(({ write }) => write({
        banner: transpilerId === 'binary'
            ? `#!/usr/bin/env node\n\n${banner}`
            : banner,
        file: outputFile,
        format: rollupFormat[format],
        name,
        sourcemap: command.flags.sourcemap,
    }))
    .then(() => transpilerCb(null))
    .catch(err => {
        console.error(err);
        transpilerCb(`Error during bundling ${input} in ${format}: Error: ${err}`);
    });
}
