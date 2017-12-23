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

export function ammendOutputMatrix(matrix, output) {
    matrix['node-classic-commonjs'] = `${output}/node.classic.commonjs.js`;
    matrix['node-classic-esmodule'] = `${output}/node.classic.esmodule.js`;
    matrix['node-es2015-commonjs'] = `${output}/node.es2015.commonjs.js`;
    matrix['node-es2015-esmodule'] = `${output}/node.es2015.esmodule.js`;

    matrix['node-modern-commonjs'] = `${output}/node.modern.commonjs.js`;
    matrix['node-modern-esmodule'] = `${output}/node.modern.esmodule.js`;
    return matrix;
}
