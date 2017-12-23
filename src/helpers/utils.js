import { sync } from 'file-exists';

export function findBest(candidates) {
    const filtered = candidates.filter(sync);
    return filtered[0];
}

export function camelize(str) {
    return str.replace(/-(.)/g, (_, char) => {
        return char.toUpperCase();
    });
}
