import babel from 'rollup-plugin-babel';
import frost from 'babel-preset-frost';

export function babelCreate({
    mode = 'classic',
    minified = false,
    presets = [],
    plugins = [],
    targetUnstable = false
}) {
    const additionalPlugins = plugins.concat();
    const additionalPresets = presets.concat();

    let selected;
    if (mode === 'modern') {
        selected = [frost, {
            target: 'modern',
            env: 'production',
            compression: minified
        }]
    } else if (mode === 'es2015') {
        selected = [frost, {
            target: 'es2015',
            env: 'production',
            compression: minified
        }]
    } else if (mode === 'binary') {
        selected = [frost, {
            target: targetUnstable ? 'node8' : 'node',
            env: 'production',
            compression: minified,
            modules: false
        }];
    } else {
        selected = [frost, {
            target: 'library',
            env: 'production',
            compression: minified
        }];
    }

    return babel({
        babelrc: false,
        runtimeHelpers: true,
        comments: minified === false,
        compact: minified === true ? true : 'auto',
        minified,
        exclude: ['node_modules/**', '**/*.json'],
        presets: [
            selected,
            ...additionalPresets
        ],
        plugins: [...additionalPlugins]
    });
}

export function createBabelConfig(opts) {
    return {
        classic: createBabelConfig({ ...options, mode: 'classic' }),
        es2015: createBabelConfig({ ...options, mode: 'es2015' }),
        modern: createBabelConfig({ ...options, mode: 'modern' }),
        binary: createBabelConfig({ ...options, mode: 'binary' })
    };
}
