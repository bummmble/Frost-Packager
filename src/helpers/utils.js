import { sync } from 'file-exists';

function doLimit(fn, limit) {
    return function(iterable, iteratee, cb) {
        return fn(iterable, limit, iteratee, cb);
    }
}

export function findBest(candidates) {
    const filtered = candidates.filter(sync);
    return filtered[0];
}

