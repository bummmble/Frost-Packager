export default function generateTargets(node, web, binary) {
    const targets = {};
    targets.node = generateNode(node);
    targets.web = generateWeb(web);
    targets.binary = generateBinary(binary);
    return targets;
}

function generateNode(node) {
    if (node) {
        return [node];
    }

    return [
        'src/server/index.js',
        'src/server/main.js',
        'src/server/server.js',
        'server/index.js',
        'server/server.js',
        'server/main.js',
        'src/server.js',
        'src/index.js'
    ];
}

function generateWeb(web) {
    if (web) {
        return [web];
    }

    return [
        'src/web/index.js',
        'src/web/web.js',
        'src/web.js',
        'src/browser/index.js',
        'src/browser/main.js',
        'src/browser/web.js',
        'src/browser/client.js'
        'src/client/index.js',
        'src/client/main.js',
        'src/client/client.js',
        'client/index.js',
        'client/web.js',
        'client/main.js'
    ];
}

function generateBinary(binary) {
    if (binary) {
        return [binary];
    }
    return ['src/binary.js', 'src/script.js', 'src/cli.js'];
}
