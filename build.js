const { rollup } = require('rollup');
const builtinModules = require('builtin-modules');
const pkg = require('./package.json');
const external = Object.keys(pkg.dependencies).concat(builtinModules);

function build() {
    return rollup({
        input: 'src/index.js',
        external
    }).then(({ write }) => write({
        file: 'dist/index.js',
        format: 'cjs'
    }))
    .then(() => console.log('built'))
    .catch(err => console.error(err));
}

build();
