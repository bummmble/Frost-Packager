const buble = require('rollup-plugin-buble');
const json = require('rollup-plugin-json');
const exec = require('rollup-plugin-exec');
const builtinModules = require('builtin-modules');
const args = require('minimist')(process.argv.slice(2));
const { rollup } = require('rollup');

const pkg = require('./package.json');
const external = Object.keys(pkg.dependencies).concat(builtinModules);

function getFormatAndFile() {
    let format, file;

    if (args.es) {
        format = 'es';
    } else {
        format = 'cjs';
    }

    if (args.cli) {
        file = 'bin/frost-packager';
    } else if (args.es) {
        file = 'dist/index.es.js';
    } else {
        file = 'dist/index.cjs.js';
    }

    return { format, file };
}

function build() {
    const { format, file } = getFormatAndFile();
    return rollup({
        input: args.cli ? 'src/cli.js' : 'src/index.js',
        external,
        plugins: [
            json(),
            buble({
                objectAssign: 'Object.assign'
            }),
            args.cli ? exec() : null
        ].filter(Boolean)
    })
    .then(({ write }) => write({
        banner: args.cli ? '#!/usr/bin/env node\n' : '',
        file,
        format,
        sourcemap: true,
    }))
    .then(() => console.log(`Successfully built ${file} in ${format} format`))
    .catch(err => console.error(err))
}

build();
