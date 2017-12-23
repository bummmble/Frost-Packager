export function generateOutputMatrix(pkg, binaryOutput) {
    return {
        'node-classic-commonjs': pkg['main'] || null,
        'node-classic-esmodule': pkg['module'] || pkg['jsnext:main'] || null,

        'node-es2015-commonjs': pkg['main:es2015'] || null,
        'node-es2015-esmodule': pkg['es2015'] || pkg['module:es2015'] || null,

        'node-modern-commonjs': pkg['main:modern'] || null,
        'node-modern-esmodule': pkg['module:modern'] || null,

        'binary-binary-commonjs': binaryOutput || null
    };

}
